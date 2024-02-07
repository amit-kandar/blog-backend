import { v4 as uuidv4 } from 'uuid';

export const generateUniqueUsernameFromName = (name: string): string => {
    let username = ''; // Initialize username variable

    // Generate a base username from name
    const nameParts = name.split(' ');
    if (nameParts.length >= 2) {
        const firstName = nameParts[0].toLowerCase();
        const lastName = nameParts[nameParts.length - 1].toLowerCase();
        username = `${firstName}_${lastName}`;
    } else {
        username = name.toLowerCase().replace(/\s/g, '');
    }

    // Generate a UUID (v4) and use it as a part of the username
    const uuid = uuidv4(); // Generate a UUID
    const uniqueUsername = `${username}_${uuid.replace(/-/g, '').substr(0, 4)}`; // Append the first 4 characters of the UUID

    return uniqueUsername;
}
