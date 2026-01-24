import { useState } from 'react';
import { Mail, CheckCircle } from 'lucide-react';

interface ContactForm {
    name: string;
    email: string;
    phone: string;
    message: string;
    preferredContact: 'phone' | 'email';
}

interface ContactModalProps {
    show: boolean;
    onClose: () => void;
    property: any;
}

export default function ContactModal({ show, onClose, property }: ContactModalProps) {
    const [contactForm, setContactForm] = useState<ContactForm>({
        name: '',
        email: '',
        phone: '',
        message: `Hi, I'm interested in this property: ${typeof window !== 'undefined' ? window.location.href : ''}`,
        preferredContact: 'email'
    });
    const [contactSubmitting, setContactSubmitting] = useState(false);
    const [contactSuccess, setContactSuccess] = useState(false);

    const handleContactSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        if (!property?.agent) return;

        try {
            setContactSubmitting(true);

            await new Promise(resolve => setTimeout(resolve, 2000));

            console.log('Contact form submitted:', {
                ...contactForm,
                agentId: property.agent.id,
                propertyId: property.id,
                propertyTitle: property.title
            });

            setContactSuccess(true);
            setTimeout(() => {
                onClose();
                setContactSuccess(false);
                setContactForm({
                    name: '',
                    email: '',
                    phone: '',
                    message: `Hi, I'm interested in this property: ${typeof window !== 'undefined' ? window.location.href : ''}`,
                    preferredContact: 'email'
                });
            }, 3000);
        } catch (error) {
            console.error('Error submitting contact form:', error);
            alert('Failed to send message. Please try again.');
        } finally {
            setContactSubmitting(false);
        }
    };

    if (!show) return null;

    return (
        <div className="fixed inset-0 bg-black/50 z-50 flex items-center justify-center p-4">
            <div className="modal modal-open">
                <div className="modal-box max-w-2xl">
                    <div className="flex items-center justify-between mb-6">
                        <h3 className="text-2xl font-bold text-base-content">
                            Contact {property.agent?.first_name}
                        </h3>
                        <button
                            onClick={onClose}
                            className="btn btn-ghost btn-circle"
                        >
                            ✕
                        </button>
                    </div>

                    {contactSuccess ? (
                        <div className="text-center py-8">
                            <CheckCircle size={64} className="text-success mx-auto mb-4" />
                            <h4 className="text-xl font-semibold text-base-content mb-2">
                                Message Sent Successfully!
                            </h4>
                            <p className="text-base-content/70">
                                {property.agent?.first_name} will contact you shortly.
                            </p>
                        </div>
                    ) : (
                        <form onSubmit={handleContactSubmit} className="space-y-4">
                            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                                <div className="form-control">
                                    <label className="label">
                                        <span className="label-text">Full Name</span>
                                    </label>
                                    <input
                                        type="text"
                                        required
                                        value={contactForm.name}
                                        onChange={(e) => setContactForm(prev => ({ ...prev, name: e.target.value }))}
                                        className="input input-bordered"
                                        placeholder="Your full name"
                                    />
                                </div>
                                <div className="form-control">
                                    <label className="label">
                                        <span className="label-text">Email Address</span>
                                    </label>
                                    <input
                                        type="email"
                                        required
                                        value={contactForm.email}
                                        onChange={(e) => setContactForm(prev => ({ ...prev, email: e.target.value }))}
                                        className="input input-bordered"
                                        placeholder="your@email.com"
                                    />
                                </div>
                            </div>

                            <div className="form-control">
                                <label className="label">
                                    <span className="label-text">Phone Number</span>
                                </label>
                                <input
                                    type="tel"
                                    value={contactForm.phone}
                                    onChange={(e) => setContactForm(prev => ({ ...prev, phone: e.target.value }))}
                                    className="input input-bordered"
                                    placeholder="+254 XXX XXX XXX"
                                />
                            </div>

                            <div className="form-control">
                                <label className="label">
                                    <span className="label-text">Preferred Contact Method</span>
                                </label>
                                <div className="flex gap-4">
                                    <label className="flex items-center gap-2 cursor-pointer">
                                        <input
                                            type="radio"
                                            name="preferredContact"
                                            checked={contactForm.preferredContact === 'email'}
                                            onChange={() => setContactForm(prev => ({ ...prev, preferredContact: 'email' }))}
                                            className="radio radio-primary"
                                        />
                                        <span className="label-text">Email</span>
                                    </label>
                                    <label className="flex items-center gap-2 cursor-pointer">
                                        <input
                                            type="radio"
                                            name="preferredContact"
                                            checked={contactForm.preferredContact === 'phone'}
                                            onChange={() => setContactForm(prev => ({ ...prev, preferredContact: 'phone' }))}
                                            className="radio radio-primary"
                                        />
                                        <span className="label-text">Phone</span>
                                    </label>
                                </div>
                            </div>

                            <div className="form-control">
                                <label className="label">
                                    <span className="label-text">Message</span>
                                </label>
                                <textarea
                                    required
                                    value={contactForm.message}
                                    onChange={(e) => setContactForm(prev => ({ ...prev, message: e.target.value }))}
                                    className="textarea textarea-bordered h-32"
                                    placeholder="Your message..."
                                />
                            </div>

                            <div className="modal-action">
                                <button
                                    type="button"
                                    onClick={onClose}
                                    className="btn btn-ghost"
                                >
                                    Cancel
                                </button>
                                <button
                                    type="submit"
                                    disabled={contactSubmitting}
                                    className="btn btn-primary gap-2"
                                >
                                    {contactSubmitting ? (
                                        <>
                                            <div className="loading loading-spinner"></div>
                                            Sending...
                                        </>
                                    ) : (
                                        <>
                                            <Mail size={20} />
                                            Send Message
                                        </>
                                    )}
                                </button>
                            </div>
                        </form>
                    )}
                </div>
            </div>
        </div>
    );
}