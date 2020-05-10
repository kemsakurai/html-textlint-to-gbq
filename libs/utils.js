class Utils {
    static stringIsAValidUrl(url) {
        try {
            new URL(s);
            return true;
        } catch (err) {
            throw new Error(`The Url format is invalid. ${s}`);
        }
    };
}
exports.Utils = Utils;

