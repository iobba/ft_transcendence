from django.contrib.postgres.fields import ArrayField
from django.contrib.auth.models import User
from django.db import models

class Profile(models.Model):
    user = models.OneToOneField(User, related_name="profile", on_delete=models.CASCADE)
    username = models.CharField(max_length=30, unique=True)
    first_name = models.CharField(max_length=30)
    last_name = models.CharField(max_length=30)
    total_score = models.IntegerField(help_text="The total points achieved by the user")
    bio = models.TextField(blank=True, null=True)
    avatar = models.TextField(default= "/image/default_avatar.png", blank=True, null=True)
    is_active = models.BooleanField(default=False)
    via_42 = models.BooleanField(default=False)
    username_42 = models.CharField(max_length=30, blank=True)
    friends = models.ManyToManyField('self', symmetrical=True, blank=True)
    blocked_friends = models.ManyToManyField('self', symmetrical=False, blank=True)
    is_2fa_enabled = models.BooleanField(default=False)
    otp_secret = models.TextField(blank=True, null=True)
    wins = ArrayField(models.IntegerField(), blank=True, default=list)
    losses = ArrayField(models.IntegerField(), blank=True, default=list)


    class Meta:
        ordering = ['username']

    def __str__(self):
        return f"{self.username}"