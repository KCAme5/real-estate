import json
from channels.generic.websocket import AsyncWebsocketConsumer
from channels.db import database_sync_to_async
from .models import Conversation, Message


class ChatConsumer(AsyncWebsocketConsumer):
    async def connect(self):
        self.user = self.scope["user"]

        # Check if user is authenticated
        if self.user.is_anonymous:
            await self.close()
            return

        # Accept the connection
        await self.accept()

    async def disconnect(self, close_code):
        # Leave any room groups we joined
        if hasattr(self, "_joined_rooms"):
            for conversation_id in self._joined_rooms:
                room_group_name = f"chat_{conversation_id}"
                await self.channel_layer.group_discard(
                    room_group_name, self.channel_name
                )

    async def receive(self, text_data):
        try:
            text_data_json = json.loads(text_data)
        except json.JSONDecodeError:
            await self.send_error("Invalid JSON")
            return

        message_type = text_data_json.get("type", "message")
        conversation_id = text_data_json.get("conversation_id")

        # Validate conversation_id
        if not conversation_id:
            await self.send_error("conversation_id is required")
            return

        # Check access to conversation
        has_access = await self.check_conversation_access(conversation_id)
        if not has_access:
            await self.send_error("Access denied to this conversation")
            return

        # Initialize joined rooms set if needed
        if not hasattr(self, "_joined_rooms"):
            self._joined_rooms = set()

        room_group_name = f"chat_{conversation_id}"

        # Join room group if not already joined
        if conversation_id not in self._joined_rooms:
            await self.channel_layer.group_add(room_group_name, self.channel_name)
            self._joined_rooms.add(conversation_id)

        if message_type == "message":
            content = text_data_json.get("content", "").strip()
            if content:
                # Save message to database
                message = await self.save_message(conversation_id, content)

                # Send message to room group
                await self.channel_layer.group_send(
                    room_group_name,
                    {
                        "type": "chat_message",
                        "conversation_id": conversation_id,
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
                room_group_name,
                {
                    "type": "typing_status",
                    "conversation_id": conversation_id,
                    "user_id": self.user.id,
                    "username": self.user.username,
                    "is_typing": is_typing,
                },
            )

    async def chat_message(self, event):
        # Send message to WebSocket
        await self.send(
            text_data=json.dumps(
                {
                    "type": "message",
                    "conversation_id": event.get("conversation_id"),
                    "message": event["message"],
                }
            )
        )

    async def typing_status(self, event):
        # Send typing status to WebSocket
        await self.send(
            text_data=json.dumps(
                {
                    "type": "typing",
                    "conversation_id": event.get("conversation_id"),
                    "user_id": event["user_id"],
                    "username": event["username"],
                    "is_typing": event["is_typing"],
                }
            )
        )

    async def send_error(self, message):
        """Send error message to client"""
        await self.send(text_data=json.dumps({"type": "error", "message": message}))

    @database_sync_to_async
    def check_conversation_access(self, conversation_id):
        try:
            conversation = Conversation.objects.get(id=conversation_id)
            return conversation.agent == self.user or conversation.client == self.user
        except Conversation.DoesNotExist:
            return False

    @database_sync_to_async
    def save_message(self, conversation_id, content):
        conversation = Conversation.objects.get(id=conversation_id)
        message = Message.objects.create(
            conversation=conversation, sender=self.user, content=content
        )
        return message
