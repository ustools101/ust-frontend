// Username validation rules:
// 1. 3-20 characters long
// 2. Can contain letters, numbers, underscores, and hyphens
// 3. Must start with a letter
// 4. No consecutive special characters
// 5. Case insensitive uniqueness
// 6. No reserved words or patterns

const RESERVED_USERNAMES = [
    // System and admin related
    'admin', 'administrator', 'root', 'system',
    'moderator', 'mod', 'support', 'help',
    'info', 'contact', 'security', 'api',
    'test', 'demo', 'example', 'null',
    'undefined', 'true', 'false',
    // System accounts
    'www', 'web', 'mail', 'email', 'webmaster',
    'hostmaster', 'postmaster', 'abuse', 'spam',
    // Common service names
    'service', 'bot', 'robot', 'auto', 'system',
    'admin1', 'admin123', 'administrator1',
    // Technical terms
    'localhost', 'root', 'sudo', 'su',
    'mysql', 'postgres', 'mongodb', 'redis',
    'ftp', 'ssh', 'http', 'https',
    // Generic terms
    'user', 'username', 'anonymous', 'guest',
    'public', 'private', 'default', 'unknown',
    // Special cases
    'me', 'i', 'you', 'we', 'they', 'it',
    // Common attack vectors
    'script', 'style', 'object', 'iframe',
    'alert', 'console', 'eval', 'function'
];

const RESTRICTED_PATTERNS = [
    /^(admin|mod|support|help|root|sudo|system).*/i,  // Extended admin patterns
    /.*(support|help|admin|root|sudo)$/i,      // Extended admin suffixes
    /^[0-9].*/,                      // Starts with number
    /.*\.(js|ts|php|html|css|exe|sh|bat|cmd|ps1|vbs|py)$/i,    // Extended file extensions
    /^api.*/i,                       // API related
    /^test.*/i,                      // Test accounts
    /^[._-].*|.*[._-]$/,            // Starts or ends with special chars
    /^(localhost|127\.0\.0\.1|0\.0\.0\.0).*/i, // Local addresses
    /(admin|root|system|mod).[0-9]+/i,  // Common admin patterns with numbers
    /^(test|demo|example|sample|temp).*[0-9]*/i, // Test/demo accounts
    /^(no-reply|noreply|postmaster|webmaster|hostmaster).*/i,  // System email prefixes
    /^(www|ftp|mail|smtp|pop|imap).*/i,  // Common server prefixes
    /<[^>]*>|\{|\}|\[|\]|\\|\/|`|'|"|;/,  // HTML/Script injection patterns
    /(%[0-9A-Fa-f]{2}){2,}/,  // URL encoded sequences
    /\.\./,  // Directory traversal
];

export interface ValidationError {
    field: string;
    message: string;
}

export function validateUsername(username: string): ValidationError | null {
    // Trim and normalize the username
    username = username.trim().normalize();

    // Check for empty username after trimming
    if (!username) {
        return {
            field: 'username',
            message: 'Username is required'
        };
    }

    // Check length (after trimming)
    if (username.length < 3 || username.length > 20) {
        return {
            field: 'username',
            message: 'Username must be between 3 and 20 characters'
        };
    }

    // Check for Unicode control characters and invisible characters
    if (/[\p{C}\p{Z}]/u.test(username)) {
        return {
            field: 'username',
            message: 'Username contains invalid characters'
        };
    }

    // Check basic pattern (letters, numbers, underscores, hyphens only)
    const validCharsRegex = /^[a-zA-Z0-9_-]+$/;
    if (!validCharsRegex.test(username)) {
        return {
            field: 'username',
            message: 'Username can only contain letters, numbers, underscores, and hyphens'
        };
    }

    // Must start with a letter
    const startsWithLetterRegex = /^[a-zA-Z]/;
    if (!startsWithLetterRegex.test(username)) {
        return {
            field: 'username',
            message: 'Username must start with a letter'
        };
    }

    // Check for consecutive special characters
    const consecutiveSpecialChars = /[_-]{2,}/;
    if (consecutiveSpecialChars.test(username)) {
        return {
            field: 'username',
            message: 'Username cannot contain consecutive special characters'
        };
    }

    // Check for common username patterns that might indicate impersonation
    const impersonationPattern = /(official|real|actual|true|genuine|verified|original).*/i;
    if (impersonationPattern.test(username)) {
        return {
            field: 'username',
            message: 'This username format is not allowed'
        };
    }

    // Check reserved usernames (case-insensitive)
    if (RESERVED_USERNAMES.includes(username.toLowerCase())) {
        return {
            field: 'username',
            message: 'This username is reserved'
        };
    }

    // Check restricted patterns
    for (const pattern of RESTRICTED_PATTERNS) {
        if (pattern.test(username)) {
            return {
                field: 'username',
                message: 'This username format is not allowed'
            };
        }
    }

    // Check for repeating characters (more than 3 times)
    if (/(.)\1{3,}/.test(username)) {
        return {
            field: 'username',
            message: 'Username cannot contain too many repeating characters'
        };
    }

    return null;
}

// Helper function to sanitize username
export function sanitizeUsername(username: string): string {
    // Normalize unicode characters
    username = username.normalize('NFKC');
    
    // Convert to lowercase
    username = username.toLowerCase();
    
    // Remove leading/trailing whitespace
    username = username.trim();
    
    // Remove any characters that aren't letters, numbers, underscores, or hyphens
    username = username.replace(/[^a-z0-9_-]/g, '');
    
    return username;
}

// Email validation with comprehensive regex
export function validateEmail(email: string): ValidationError | null {
    const emailRegex = /^[a-zA-Z0-9.!#$%&'*+/=?^_`{|}~-]+@[a-zA-Z0-9](?:[a-zA-Z0-9-]{0,61}[a-zA-Z0-9])?(?:\.[a-zA-Z0-9](?:[a-zA-Z0-9-]{0,61}[a-zA-Z0-9])?)*$/;
    
    if (!email || !emailRegex.test(email)) {
        return {
            field: 'email',
            message: 'Please enter a valid email address'
        };
    }

    return null;
}

// Password validation
export function validatePassword(password: string): ValidationError | null {
    if (password.length < 8) {
        return {
            field: 'password',
            message: 'Password must be at least 8 characters long'
        };
    }

    // Check for at least one uppercase letter
    if (!/[A-Z]/.test(password)) {
        return {
            field: 'password',
            message: 'Password must contain at least one uppercase letter'
        };
    }

    // Check for at least one lowercase letter
    if (!/[a-z]/.test(password)) {
        return {
            field: 'password',
            message: 'Password must contain at least one lowercase letter'
        };
    }

    // Check for at least one number
    if (!/[0-9]/.test(password)) {
        return {
            field: 'password',
            message: 'Password must contain at least one number'
        };
    }

    // Check for at least one special character
    if (!/[!@#$%^&*(),.?":{}|<>]/.test(password)) {
        return {
            field: 'password',
            message: 'Password must contain at least one special character'
        };
    }

    return null;
}

// URL validation
export function isValidUrl(url: string): boolean {
    try {
        // Basic URL validation
        const urlObj = new URL(url);
        
        // Check for required parts
        if (!urlObj.protocol || !urlObj.host) {
            return false;
        }

        // Only allow http and https protocols
        if (!['http:', 'https:'].includes(urlObj.protocol)) {
            return false;
        }

        // Check for reasonable length
        if (url.length > 2048) {
            return false;
        }

        // Check for common TLDs (optional, remove if too restrictive)
        const validTLDs = /\.(com|net|org|edu|gov|mil|biz|info|name|museum|coop|aero|[a-z]{2})$/i;
        if (!validTLDs.test(urlObj.hostname)) {
            return false;
        }

        return true;
    } catch {
        return false;
    }
}

