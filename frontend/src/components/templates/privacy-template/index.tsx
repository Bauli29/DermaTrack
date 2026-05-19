'use client'

import { useEffect } from 'react'

import { usePageTitle } from '@/hooks/use-page-title'

import * as SC from './styles'

const PrivacyTemplate = () => {
  const { setTitle } = usePageTitle()

  useEffect(() => {
    setTitle('Privacy Policy')
  }, [setTitle])

  return (
    <SC.PageWrapper>
      <SC.ContentPageWrapper>
        <SC.Header>
          <SC.Title>Privacy Policy</SC.Title>

          <SC.LastUpdated>Last updated: May 11, 2026</SC.LastUpdated>
        </SC.Header>

        <SC.Section>
          <SC.SectionTitle>Information We Collect</SC.SectionTitle>

          <SC.Paragraph>
            When you use DermaTrack, we may collect personal and technical
            information necessary to provide and improve our services. This may
            include your name, email address, account credentials, profile
            information, and any data you voluntarily submit through the
            platform. We also collect usage data such as interactions within the
            application, device information, IP address, and diagnostic logs to
            ensure proper functionality and improve user experience.
          </SC.Paragraph>
        </SC.Section>

        <SC.Section>
          <SC.SectionTitle>How We Use Information</SC.SectionTitle>

          <SC.Paragraph>
            The information we collect is used to operate, maintain, and enhance
            the DermaTrack platform. This includes providing core functionality,
            personalizing your experience, improving system performance, and
            developing new features. We may also use your information to
            communicate important updates, respond to support requests, and
            ensure compliance with applicable legal obligations.
          </SC.Paragraph>
        </SC.Section>

        <SC.Section>
          <SC.SectionTitle>Authentication & Security</SC.SectionTitle>

          <SC.Paragraph>
            We implement appropriate technical, administrative, and
            organizational security measures designed to protect your personal
            information against unauthorized access, loss, misuse, or
            alteration. This includes secure authentication systems, encrypted
            data transmission, and restricted access to sensitive data. While we
            strive to protect your information, no method of transmission over
            the internet is completely secure.
          </SC.Paragraph>
        </SC.Section>

        <SC.Section>
          <SC.SectionTitle>Third-Party Services</SC.SectionTitle>

          <SC.Paragraph>
            We may use trusted third-party service providers for infrastructure
            hosting, analytics, authentication, and other operational needs.
            These providers may process data on our behalf strictly for the
            purpose of delivering and improving DermaTrack services. We ensure
            that any third parties we work with adhere to appropriate data
            protection and security standards.
          </SC.Paragraph>
        </SC.Section>

        <SC.Section>
          <SC.SectionTitle>GDPR Rights</SC.SectionTitle>

          <SC.Paragraph>
            If you are located in the European Economic Area (EEA), you are
            entitled to certain rights under the General Data Protection
            Regulation (GDPR). These rights may include access to your personal
            data, correction of inaccurate information, deletion of your data,
            restriction of processing, and data portability. You also have the
            right to object to certain types of data processing and to lodge a
            complaint with a supervisory authority.
          </SC.Paragraph>
        </SC.Section>

        <SC.Section>
          <SC.SectionTitle>Data Retention</SC.SectionTitle>

          <SC.Paragraph>
            We retain personal data only for as long as necessary to fulfill the
            purposes outlined in this Privacy Policy, including providing our
            services, complying with legal obligations, resolving disputes, and
            enforcing agreements. When data is no longer required, it is
            securely deleted or anonymized.
          </SC.Paragraph>
        </SC.Section>

        <SC.Section>
          <SC.SectionTitle>Changes to This Policy</SC.SectionTitle>

          <SC.Paragraph>
            We may update this Privacy Policy periodically to reflect changes in
            our practices, technologies, or legal requirements. When updates
            occur, we will revise the “Last updated” date above. Continued use
            of DermaTrack after such changes constitutes acceptance of the
            updated policy.
          </SC.Paragraph>
        </SC.Section>

        <SC.Section>
          <SC.SectionTitle>Contact</SC.SectionTitle>

          <SC.Paragraph>
            If you have any questions, concerns, or requests regarding this
            Privacy Policy or your personal data, you may contact us at
            privacy@dermatrack.com. We aim to respond to all inquiries in a
            timely and transparent manner.
          </SC.Paragraph>
        </SC.Section>
      </SC.ContentPageWrapper>
    </SC.PageWrapper>
  )
}

export default PrivacyTemplate
