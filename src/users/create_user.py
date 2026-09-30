from dataclasses import dataclass
from exceptions import DuplicateEmailError


@dataclass
class CreateUserRequest:
    email: str
    full_name: str


class CreateUser:
    """Feature: crea un usuario nuevo validando que el email no exista."""

    def __init__(self, user_repository):
        self.user_repository = user_repository

    def execute(self, request: CreateUserRequest):
        if self.user_repository.find_by_email(request.email):
            raise DuplicateEmailError(request.email)
        return self.user_repository.save(request.email, request.full_name)
