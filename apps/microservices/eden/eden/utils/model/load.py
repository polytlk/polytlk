"""This module ensures NLP model is cached on disk.

This script is called during the docker build

prevents wasteful downloads on container restart.
prevents downloads on first request in the task system
"""
import hanlp

from eden.utils.model.constants import HANLP_MODEL_NAME

model = hanlp.load(HANLP_MODEL_NAME)
