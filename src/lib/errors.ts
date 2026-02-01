export class PasteNotFoundError extends Error {
    constructor(message: string = 'Paste not found') {
        super(message);
        this.name = 'PasteNotFoundError';
    }
}

export class PasteExpiredError extends Error {
    constructor(message: string = 'This paste has expired based on its TTL setting.') {
        super(message);
        this.name = 'PasteExpiredError';
    }
}

export class PasteViewLimitError extends Error {
    constructor(message: string = 'This paste has reached its maximum view limit.') {
        super(message);
        this.name = 'PasteViewLimitError';
    }
}
