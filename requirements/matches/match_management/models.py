from django.contrib.postgres.fields import ArrayField
from django.db import models

class Match(models.Model):
    winners = ArrayField(models.IntegerField(), blank=True, default=list)
    losers = ArrayField(models.IntegerField(), blank=True, default=list)
    winner_score = models.IntegerField(default=0, help_text="The score achieved by the winners")
    loser_score = models.IntegerField(default=0, help_text="The score achieved by the losers")
    date_played = models.DateTimeField(auto_now_add=True, help_text="Date and time when the match was played")

    class Meta:
        ordering = ['-date_played']
