import { Link } from "wouter";
import { Facebook, Instagram, Twitter } from "lucide-react";
import { FeedbackDialog } from "./FeedbackDialog";
import { ShareDialog } from "./ShareDialog";

const Footer = () => {
    return (
        <footer className="bg-soil text-white py-8">
            <div className="container mx-auto px-4">
                <div className="grid grid-cols-1 md:grid-cols-4 gap-8">
                    <div>
                        <h3 className="font-cormorant font-light text-xl tracking-wide mb-4">
                            <span className="text-white">Expat</span>
                            <span className="text-bark-lt">Eats</span>
                        </h3>
                        <p className="text-white font-outfit opacity-80 mb-4">
                            Your guide to healthy living abroad
                        </p>
                        <div className="flex space-x-4 mb-4">
                            <a
                                href="#"
                                className="text-white opacity-80 hover:opacity-100 transition-elegant"
                            >
                                <Facebook className="h-5 w-5" />
                            </a>
                            <a
                                href="https://instagram.com/expateatsguide"
                                target="_blank"
                                rel="noopener noreferrer"
                                className="text-white opacity-80 hover:opacity-100 transition-elegant"
                            >
                                <Instagram className="h-5 w-5" />
                            </a>
                            <a
                                href="#"
                                className="text-white opacity-80 hover:opacity-100 transition-elegant"
                            >
                                <Twitter className="h-5 w-5" />
                            </a>
                        </div>
                        <div className="flex flex-col sm:flex-row gap-3">
                            <ShareDialog
                                buttonVariant="outline"
                                buttonSize="sm"
                                buttonText="Share"
                                buttonClassName="bg-transparent border-white/30 text-white hover:bg-white/10 hover:text-white font-outfit"
                            />
                            <FeedbackDialog
                                buttonClassName="bg-transparent border-white/30 text-white hover:bg-white/10 hover:text-white font-outfit"
                            />
                        </div>
                    </div>

                    <div>
                        <h4 className="font-outfit font-semibold mb-4 text-white">
                            Features
                        </h4>
                        <ul className="space-y-2 font-outfit">
                            <li>
                                <Link
                                    className="text-white opacity-80 hover:opacity-100 transition-elegant"
                                    href="/search"
                                >
                                    Food Sources
                                </Link>
                            </li>
                            <li>
                                <Link
                                    className="text-white opacity-80 hover:opacity-100 transition-elegant"
                                    href="/events"
                                >
                                    Community Events
                                </Link>
                            </li>
                            <li>
                                <Link
                                    className="text-white opacity-80 hover:opacity-100 transition-elegant"
                                    href="/resources"
                                >
                                    Food Resources
                                </Link>
                            </li>
                            <li>
                                <Link
                                    className="text-white opacity-80 hover:opacity-100 transition-elegant"
                                    href="/services"
                                >
                                    Services
                                </Link>
                            </li>
                        </ul>
                    </div>

                    <div>
                        <h4 className="font-outfit font-semibold mb-4 text-white">
                            Countries
                        </h4>
                        <ul className="space-y-2 font-outfit">
                            <li>
                                <button className="text-white opacity-80 hover:opacity-100 transition-elegant">
                                    Portugal
                                </button>
                            </li>
                            <li>
                                <span className="text-white opacity-60 italic">
                                    More Coming Soon!
                                </span>
                            </li>
                        </ul>
                    </div>

                    <div>
                        <h4 className="font-outfit font-semibold mb-4 text-white">
                            Support
                        </h4>
                        <ul className="space-y-2 font-outfit">
                            <li>
                                <Link
                                    className="text-white opacity-80 hover:opacity-100 transition-elegant"
                                    href="/contact-us"
                                >
                                    Contact Us
                                </Link>
                            </li>
                        </ul>
                    </div>
                </div>

                <div className="border-t border-white border-opacity-20 mt-8 pt-6">
                    <div className="flex flex-col items-center space-y-2 font-outfit">
                        <div className="flex items-center space-x-4 text-xs text-white opacity-70">
                            <button className="hover:opacity-100 transition-elegant">
                                Privacy Policy
                            </button>
                            <span>•</span>
                            <Link href="/terms" className="hover:opacity-100 transition-elegant">
                                Terms and Conditions
                            </Link>
                        </div>
                        <p className="text-xs text-white opacity-70">
                            Copyright Checkmate 2025 all rights reserved
                        </p>
                    </div>
                </div>
            </div>
        </footer>
    );
};

export default Footer;
