class OnlineAdmins {
    constructor() {
        this.admins = [];
    }

    addAdmin(phone, socketId) {
        const exists = this.admins.some(admin => admin.phone === phone);
        if (!exists) {
            this.admins.push({ phone, socketId });
        }
    }

    removeAdmin(phone) {
        this.admins = this.admins.filter(admin => admin.phone !== phone);
    }

    removeAdminBySocketId(id) {
        this.admins = this.admins.filter(admin => admin.socketId !== id);
    }

    getAdmins() {
        return this.admins;
    }
}

// Create a singleton instance
// const instance = new OnlineAdmins();
// Object.freeze(instance);
const instance = new OnlineAdmins();
// Export the singleton instance for use in other files
module.exports = instance;
