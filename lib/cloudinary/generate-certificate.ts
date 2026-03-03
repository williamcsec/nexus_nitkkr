import cloudinary from './config';

export function generateCertificateUrl(studentName: string, eventName: string, templatePublicId: string) {
    // We use Cloudinary's URL builder to attach text overlays dynamically
    return cloudinary.url(templatePublicId, {
        secure: true,
        transformation: [
            { width: 2000, crop: "scale" },
            // Overlay 1: Student Name
            {
                overlay: {
                    font_family: "Times New Roman",
                    font_size: 100,
                    font_weight: "bold",
                    text: studentName
                },
                color: "#000000",
                y: -100 // Adjust Y offset based on template
            },
            // Overlay 2: Event Name
            {
                overlay: {
                    font_family: "Arial",
                    font_size: 60,
                    text: eventName
                },
                color: "#555555",
                y: 150 // Adjust Y offset based on template
            }
        ]
    });
}
