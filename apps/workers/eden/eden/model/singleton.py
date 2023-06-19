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
from typing import Any, Protocol, Type

import hanlp

from eden.model.constants import HANLP_MODEL_NAME
from eden.tracing import tracer


class LoggerProtocol(Protocol):
    """Type the logger interface."""

    def warn(self, message: Any, *args: Any, **kwargs: Any) -> None:
        """Ensure warn method."""

    def info(self, message: Any, *args: Any, **kwargs: Any) -> None:  # noqa: WPS110
        """Ensure log method."""

    def debug(self, message: Any, *args: Any, **kwargs: Any) -> None:
        """Ensure debug method."""


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

    def __init__(self, logger: LoggerProtocol) -> None:
        """
        Initialize the ModelLoader instance.

        Args:
            logger (LoggerProtocol): The logger to be used for logging messages.
        """
        self.model = None
        self.logger = logger

    def load_model(self) -> Any:
        """
        Load the HanLP model if not already loaded.

        Returns:
            Loaded HanLP model.
        """
        with tracer.start_as_current_span('Load NLP Model'):
            if not self.model:
                self.logger.warn('NO MODEL')
                # Code to load the model goes here
                self.model = hanlp.load(HANLP_MODEL_NAME)
                self.logger.info('Model assigned')

            self.logger.debug('RETURN MODEL')
            return self.model
