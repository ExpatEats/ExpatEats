import React from "react";
import { Link } from "wouter";
import { Button } from "@/components/ui/button";
import { Separator } from "@/components/ui/separator";

export default function Terms() {
    return (
        <div className="container py-8 max-w-4xl mx-auto">
            <h1 className="text-3xl font-bold mb-6">Terms and Conditions</h1>
            <p className="text-gray-600 mb-8">Last updated: May 20, 2025</p>

            <div className="prose prose-slate max-w-none">
                <h2 className="text-xl font-semibold">1. Introduction</h2>
                <p>
                    Welcome to Expat Eats ("we," "our," or "us"). These Terms
                    and Conditions govern your use of our website and services,
                    including our mobile application (collectively, the
                    "Service"). By accessing or using our Service, you agree to
                    be bound by these Terms. If you disagree with any part of
                    these terms, you may not access the Service.
                </p>

                <h2 className="text-xl font-semibold mt-6">
                    2. Use of Our Service
                </h2>
                <p>
                    Expat Eats provides information about food sources,
                    including but not limited to grocery stores, markets, farms,
                    and specialty food retailers. Our Service is intended to
                    help expatriates locate food sources that meet their dietary
                    preferences and needs.
                </p>
                <p>
                    All information provided through our Service is for general
                    informational purposes only. While we strive to provide
                    accurate and up-to-date information, we make no
                    representations or warranties of any kind, express or
                    implied, about the completeness, accuracy, reliability,
                    suitability, or availability of the information, products,
                    services, or related graphics contained on the Service.
                </p>

                <h2 className="text-xl font-semibold mt-6">3. User Accounts</h2>
                <p>
                    When you create an account with us, you must provide
                    information that is accurate, complete, and current at all
                    times. Failure to do so constitutes a breach of the Terms,
                    which may result in immediate termination of your account.
                </p>
                <p>
                    You are responsible for safeguarding the password that you
                    use to access the Service and for any activities or actions
                    under your password. You agree not to disclose your password
                    to any third party. You must notify us immediately upon
                    becoming aware of any breach of security or unauthorized use
                    of your account.
                </p>

                <h2 className="text-xl font-semibold mt-6">
                    4. Intellectual Property
                </h2>
                <p>
                    The Service and its original content, features, and
                    functionality are and will remain the exclusive property of
                    Expat Eats and its licensors. The Service is protected by
                    copyright, trademark, and other laws. Our trademarks and
                    trade dress may not be used in connection with any product
                    or service without the prior written consent of Expat Eats.
                </p>

                <h2 className="text-xl font-semibold mt-6">
                    5. User Contributions
                </h2>
                <p>
                    Users may contribute content to our Service, including
                    reviews, comments, and other materials. By posting content,
                    you grant us a non-exclusive, royalty-free, perpetual,
                    irrevocable, and fully sublicensable right to use,
                    reproduce, modify, adapt, publish, translate, create
                    derivative works from, distribute, and display such content
                    throughout the world in any media.
                </p>
                <p>
                    You represent and warrant that you own or control all rights
                    to the content you post, that the content is accurate, and
                    that use of the content does not violate these Terms and
                    will not cause injury to any person or entity.
                </p>

                <h2 className="text-xl font-semibold mt-6">
                    6. Third-Party Links
                </h2>
                <p>
                    Our Service may contain links to third-party websites or
                    services that are not owned or controlled by Expat Eats. We
                    have no control over, and assume no responsibility for, the
                    content, privacy policies, or practices of any third-party
                    websites or services. You further acknowledge and agree that
                    Expat Eats shall not be responsible or liable, directly or
                    indirectly, for any damage or loss caused or alleged to be
                    caused by or in connection with the use of or reliance on
                    any such content, goods, or services available on or through
                    any such websites or services.
                </p>

                <h2 className="text-xl font-semibold mt-6">
                    7. Limitation of Liability
                </h2>
                <p>
                    To the maximum extent permitted by applicable law, in no
                    event shall Expat Eats, its directors, employees, partners,
                    agents, suppliers, or affiliates be liable for any indirect,
                    incidental, special, consequential, or punitive damages,
                    including without limitation, loss of profits, data, use,
                    goodwill, or other intangible losses, resulting from:
                </p>
                <ul className="list-disc pl-6 mb-4">
                    <li>
                        Your access to or use of or inability to access or use
                        the Service;
                    </li>
                    <li>
                        Any conduct or content of any third party on the
                        Service;
                    </li>
                    <li>Any content obtained from the Service; and</li>
                    <li>
                        Unauthorized access, use, or alteration of your
                        transmissions or content.
                    </li>
                </ul>
                <p>
                    Expat Eats specifically disclaims any liability related to
                    food allergies or sensitivities. While we provide
                    information about food sources that may accommodate certain
                    dietary restrictions or preferences, we cannot guarantee
                    that any food source is completely free from specific
                    ingredients or allergens. Users with severe allergies or
                    strict dietary requirements should always directly verify
                    information with food vendors before making purchases or
                    consumption decisions.
                </p>

                <h2 className="text-xl font-semibold mt-6">
                    8. Health Disclaimer
                </h2>
                <p>
                    The information provided by Expat Eats is not intended to be
                    a substitute for professional medical advice, diagnosis, or
                    treatment. Always seek the advice of your physician or other
                    qualified health provider with any questions you may have
                    regarding a medical condition or dietary requirements. Never
                    disregard professional medical advice or delay in seeking it
                    because of something you have read on our Service.
                </p>

                <h2 className="text-xl font-semibold mt-6">9. Governing Law</h2>
                <p>
                    These Terms shall be governed and construed in accordance
                    with the laws of Portugal, without regard to its conflict of
                    law provisions. Our failure to enforce any right or
                    provision of these Terms will not be considered a waiver of
                    those rights. If any provision of these Terms is held to be
                    invalid or unenforceable by a court, the remaining
                    provisions of these Terms will remain in effect.
                </p>

                <h2 className="text-xl font-semibold mt-6">
                    10. Changes to Terms
                </h2>
                <p>
                    We reserve the right, at our sole discretion, to modify or
                    replace these Terms at any time. If a revision is material,
                    we will provide at least 30 days' notice prior to any new
                    terms taking effect. What constitutes a material change will
                    be determined at our sole discretion. By continuing to
                    access or use our Service after any revisions become
                    effective, you agree to be bound by the revised terms.
                </p>

                <h2 className="text-xl font-semibold mt-6">11. Contact Us</h2>
                <p>
                    If you have any questions about these Terms, please contact
                    us at:
                </p>
                <address className="mt-2 not-italic">
                    Expat Eats
                    <br />
                    support@expateats.example.com
                    <br />
                    Av. da Liberdade 110, 1269-046 Lisboa, Portugal
                </address>
            </div>

            <Separator className="my-8" />

            <div className="flex flex-col sm:flex-row justify-center gap-4">
                <Link href="/">
                    <Button variant="outline">Return to Home</Button>
                </Link>
                <Link href="/search">
                    <Button>Find Food Sources</Button>
                </Link>
            </div>
        </div>
    );
}
