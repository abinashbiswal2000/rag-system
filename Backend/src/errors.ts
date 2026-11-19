// An error that carries an HTTP status and a message that is safe to show the client.
export class AppError extends Error {
    constructor(public readonly status: number, message: string) {
        super(message);
        this.name = "AppError";
    }
}
