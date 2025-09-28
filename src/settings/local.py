from .base import *
import os

DEBUG = True

ALLOWED_HOSTS = ['*']

import dj_database_url
# DATABASES['default'] =  dj_database_url.config()
#updated
DATABASES = {'default': dj_database_url.config(default='postgres://user:pass@localhost/dbname')}