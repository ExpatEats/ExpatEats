import { Link } from "wouter";
import { Facebook, Instagram, Twitter } from "lucide-react";
import { FeedbackDialog } from "./FeedbackDialog";
import { ShareDialog } from "./ShareDialog";

const Footer = () => {
    return (
        <footer className="bg-[#6D9075] text-white py-8">
            <div className="container mx-auto px-4">
                <div className="grid grid-cols-1 md:grid-cols-4 gap-8">
                    <div>
                        <h3 className="font-montserrat font-light text-xl tracking-wide mb-4">
                            <span className="text-[#F7F4EF]">Expat</span>
                            <span className="text-[#DDB892]">Eats</span>
                        </h3>
                        <p className="text-[#F7F4EF] opacity-80 mb-4">
                            Your guide to healthy living abroad
                        </p>
                        <div className="flex space-x-4 mb-4">
                            <a
                                href="#"
                                className="text-[#F7F4EF] opacity-80 hover:opacity-100 transition"
                            >
                                <Facebook className="h-5 w-5" />
                            </a>
                            <a
                                href="#"
                                className="text-[#F7F4EF] opacity-80 hover:opacity-100 transition"
                            >
                                <Instagram className="h-5 w-5" />
                            </a>
                            <a
                                href="#"
                                className="text-[#F7F4EF] opacity-80 hover:opacity-100 transition"
                            >
                                <Twitter className="h-5 w-5" />
                            </a>
                        </div>
                        <div className="flex flex-col sm:flex-row gap-3">
                            <ShareDialog
                                buttonVariant="outline"
                                buttonSize="sm"
                                buttonText="Share"
                                buttonClassName="bg-transparent border-white/30 text-white hover:bg-white/10 hover:text-white"
                            />
                            <FeedbackDialog
                                buttonClassName="bg-transparent border-white/30 text-white hover:bg-white/10 hover:text-white"
                            />
                        </div>
                    </div>

                    <div>
                        <h4 className="font-montserrat font-semibold mb-4 text-[#F7F4EF]">
                            Features
                        </h4>
                        <ul className="space-y-2">
                            <li>
                                <Link
                                    className="text-[#F7F4EF] opacity-80 hover:opacity-100 transition"
                                    href="/search"
                                >
                                    Food Sources
                                </Link>
                            </li>
                            <li>
                                <Link
                                    className="text-[#F7F4EF] opacity-80 hover:opacity-100 transition"
                                    href="/events"
                                >
                                    Community Events
                                </Link>
                            </li>
                            <li>
                                <Link
                                    className="text-[#F7F4EF] opacity-80 hover:opacity-100 transition"
                                    href="/resources"
                                >
                                    Food Resources
                                </Link>
                            </li>
                            <li>
                                <Link
                                    className="text-[#F7F4EF] opacity-80 hover:opacity-100 transition"
                                    href="/services"
                                >
                                    Services
                                </Link>
                            </li>
                        </ul>
                    </div>

                    <div>
                        <h4 className="font-montserrat font-semibold mb-4 text-[#F7F4EF]">
                            Countries
                        </h4>
                        <ul className="space-y-2">
                            <li>
                                <button className="text-[#F7F4EF] opacity-80 hover:opacity-100 transition">
                                    Portugal
                                </button>
                            </li>
                            <li>
                                <span className="text-[#F7F4EF] opacity-60 italic">
                                    More Coming Soon!
                                </span>
                            </li>
                        </ul>
                    </div>

                    <div>
                        <h4 className="font-montserrat font-semibold mb-4 text-[#F7F4EF]">
                            Support
                        </h4>
                        <ul className="space-y-2">
                            <li>
                                <Link
                                    className="text-[#F7F4EF] opacity-80 hover:opacity-100 transition"
                                    href="/contact-us"
                                >
                                    Contact Us
                                </Link>
                            </li>
                        </ul>
                    </div>
                </div>

                <div className="border-t border-[#F7F4EF] border-opacity-20 mt-8 pt-6">
                    <div className="flex flex-col items-center space-y-2">
                        <div className="flex items-center space-x-4 text-xs text-[#F7F4EF] opacity-70">
                            <button className="hover:opacity-100 transition">
                                Privacy Policy
                            </button>
                            <span>•</span>
                            <Link href="/terms" className="hover:opacity-100 transition">
                                Terms and Conditions
                            </Link>
                        </div>
                        <p className="text-xs text-[#F7F4EF] opacity-70">
                            Copyright Checkmate 2025 all rights reserved
                        </p>
                    </div>
                </div>
            </div>
        </footer>
    );
};

export default Footer;
