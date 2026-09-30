class DuplicateEmailError(Exception):
    def __init__(self, email: str):
        super().__init__(f"El email {email} ya está en uso")
        self.email = email
