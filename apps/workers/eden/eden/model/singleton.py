"""This module ensures efficient loading of NLP model in task system.

The model loaded is specified by the constant HANLP_MODEL_NAME, imported from the constants module.

Singleton Pattern:
Singleton is a design pattern that restricts the instantiation of a class to a single instance and
provides a global point of access to it.

ModelLoader class:
This class implements the Singleton pattern to ensure that only one instance of the model is loaded
and kept in memory. This is especially useful for large models that take up a lot of memory and take
a long time to load. It has a `load_model` method which loads the model if it's not already loaded.

Usage:
Use the `load_model` method of the ModelLoader class to get the loaded model. If the model is not
already loaded, it will be loaded on the first call and the same instance will be returned on
subsequent calls.

Example:
    model_loader = ModelLoader()
    model = model_loader.load_model()
"""
from typing import Any, Type

import hanlp
from opentelemetry import trace

from eden.model.constants import HANLP_MODEL_NAME


class Singleton(type):
    """Metaclass to implement Singleton pattern."""

    _instances: dict[Type[Any], Any] = {}

    def __call__(cls: Type[Any], *args: Any, **kwargs: Any) -> Any:
        r"""
        Create new instance if no given cls exists, otherwise return the existing instance.

        Args:
            cls (Type[Any]): The class for which the instance should be returned.
            \*args: Variable length argument list.
            \**kwargs: Arbitrary keyword arguments.

        Returns:
            Instance of the given class.
        """
        if cls not in cls._instances:
            cls._instances[cls] = super().__call__(*args, **kwargs)
        return cls._instances[cls]


class ModelLoader(object, metaclass=Singleton):
    """Model Loader singleton class."""

    def __init__(self) -> None:
        """Initialize the ModelLoader instance."""
        self.model = None

    def load_model(self) -> Any:
        """
        Load the HanLP model if not already loaded.

        Returns:
            Loaded HanLP model.
        """
        span = trace.get_current_span()
        span.set_attribute('com.polytlk.eden.model_name', HANLP_MODEL_NAME)

        if self.model:
            span.set_attribute('com.polytlk.eden.model_preloaded', value=True)
        else:
            span.set_attribute('com.polytlk.eden.model_preloaded', value=False)
            self.model = hanlp.load(HANLP_MODEL_NAME)
            span.set_attribute('com.polytlk.eden.model_did_load', value=True)

        return self.model
