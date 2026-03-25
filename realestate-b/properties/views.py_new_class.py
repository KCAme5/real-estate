
class ManagementPropertyDetailView(generics.RetrieveUpdateDestroyAPIView):
    serializer_class = PropertyDetailSerializer
    permission_classes = [permissions.IsAuthenticated]
    
    def get_queryset(self):
        if self.request.user.user_type != 'management':
            return Property.objects.none()
        return Property.objects.all()
