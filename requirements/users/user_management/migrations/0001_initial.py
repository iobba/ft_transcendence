# Generated by Django 5.0 on 2024-06-11 12:08

import django.contrib.postgres.fields
import django.db.models.deletion
from django.conf import settings
from django.db import migrations, models


class Migration(migrations.Migration):

    initial = True

    dependencies = [
        migrations.swappable_dependency(settings.AUTH_USER_MODEL),
    ]

    operations = [
        migrations.CreateModel(
            name='Profile',
            fields=[
                ('id', models.BigAutoField(auto_created=True, primary_key=True, serialize=False, verbose_name='ID')),
                ('username', models.CharField(max_length=30, unique=True)),
                ('first_name', models.CharField(max_length=30)),
                ('last_name', models.CharField(max_length=30)),
                ('total_score', models.IntegerField(help_text='The total points achieved by the user')),
                ('bio', models.TextField(blank=True, null=True)),
                ('avatar', models.TextField(blank=True, default='/image/default_avatar.png', null=True)),
                ('is_playing', models.BooleanField(default=False)),
                ('is_active', models.BooleanField(default=True)),
                ('via_42', models.BooleanField(default=False)),
                ('username_42', models.CharField(blank=True, max_length=30)),
                ('is_2fa_enabled', models.BooleanField(default=False)),
                ('otp_secret', models.TextField(blank=True, null=True)),
                ('wins', django.contrib.postgres.fields.ArrayField(base_field=models.IntegerField(), blank=True, default=list, size=None)),
                ('losses', django.contrib.postgres.fields.ArrayField(base_field=models.IntegerField(), blank=True, default=list, size=None)),
                ('blocked_friends', models.ManyToManyField(blank=True, to='user_management.profile')),
                ('friends', models.ManyToManyField(blank=True, to='user_management.profile')),
                ('user', models.OneToOneField(on_delete=django.db.models.deletion.CASCADE, related_name='profile', to=settings.AUTH_USER_MODEL)),
            ],
            options={
                'ordering': ['username'],
            },
        ),
    ]
