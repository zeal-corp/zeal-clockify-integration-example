export class ResourceNotFoundException extends Error {
    readonly name = "ResourceNotFound";
    readonly status = 404;

    constructor(resource: string) {
        super(resource + " resource could not be found.");
    }
}

export class InvalidTimeEntryException extends Error {
    readonly name = "InvalidTimeEntryException";
    readonly status = 400;
    
    constructor(message: string) {
        super(message)
    }
}