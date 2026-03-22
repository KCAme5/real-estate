import json
from channels.generic.websocket import AsyncWebsocketConsumer
from channels.db import database_sync_to_async
from .models import Conversation, Message


class ChatConsumer(AsyncWebsocketConsumer):
    async def connect(self):
        self.user = self.scope["user"]
        self.conversation_id = None
        self.room_group_name = None

        # Check if user is authenticated
        if self.user.is_anonymous:
            await self.close()
            return

        # Accept the connection - user will join specific rooms when they send messages
        await self.accept()

    async def disconnect(self, close_code):
        # Leave room group
        await self.channel_layer.group_discard(self.room_group_name, self.channel_name)

    async def receive(self, text_data):
        text_data_json = json.loads(text_data)
        message_type = text_data_json.get("type", "message")

        if message_type == "message":
            content = text_data_json.get("content", "")
            if content:
                # Save message to database
                message = await self.save_message(content)

                # Send message to room group
                await self.channel_layer.group_send(
                    self.room_group_name,
                    {
                        "type": "chat_message",
                        "message": {
                            "id": message.id,
                            "content": message.content,
                            "sender": message.sender.id,
                            "sender_name": message.sender.username,
                            "sender_type": (
                                "agent"
                                if hasattr(message.sender, "agentprofile")
                                else "client"
                            ),
                            "created_at": message.created_at.isoformat(),
                            "is_read": message.is_read,
                        },
                    },
                )
        elif message_type == "typing":
            is_typing = text_data_json.get("is_typing", False)
            # Broadcast typing status to room group
            await self.channel_layer.group_send(
                self.room_group_name,
                {
                    "type": "typing_status",
                    "user_id": self.user.id,
                    "username": self.user.username,
                    "is_typing": is_typing,
                },
            )

    async def chat_message(self, event):
        # Send message to WebSocket
        await self.send(
            text_data=json.dumps({"type": "message", "message": event["message"]})
        )

    async def typing_status(self, event):
        # Send typing status to WebSocket
        await self.send(
            text_data=json.dumps(
                {
                    "type": "typing",
                    "user_id": event["user_id"],
                    "username": event["username"],
                    "is_typing": event["is_typing"],
                }
            )
        )

    @database_sync_to_async
    def check_conversation_access(self):
        try:
            conversation = Conversation.objects.get(id=self.conversation_id)
            return conversation.agent == self.user or conversation.client == self.user
        except Conversation.DoesNotExist:
            return False

    @database_sync_to_async
    def save_message(self, content):
        conversation = Conversation.objects.get(id=self.conversation_id)
        message = Message.objects.create(
            conversation=conversation, sender=self.user, content=content
        )
        return message
