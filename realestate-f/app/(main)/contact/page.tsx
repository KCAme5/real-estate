// app/contact/page.tsx
import ContactHero from '@/components/sections/ContactHero';
import ContactFormSection from '@/components/sections/ContactForm';
import ContactInfo from '@/components/sections/ContactInfo';
import ContactFAQ from '@/components/sections/ContactFAQ';

export default function ContactPage() {
    return (
        <>
            <ContactHero />
            <ContactFormSection />
            <ContactInfo />
            <ContactFAQ />
        </>
    );
}