class AppError(Exception):
    def __init__(self, detail: str, status_code: int = 400) -> None:
        super().__init__(detail)
        self.detail = detail
        self.status_code = status_code


class NotFoundError(AppError):
    def __init__(self, detail: str) -> None:
        super().__init__(detail, status_code=404)


class BusinessRuleError(AppError):
    def __init__(self, detail: str) -> None:
        super().__init__(detail, status_code=400)
