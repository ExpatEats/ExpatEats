import { Link } from "wouter";
import { Facebook, Instagram, Twitter } from "lucide-react";

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
                            Your Guide to Sustainable Living Abroad
                        </p>
                        <div className="flex space-x-4">
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
                                    href="/contact"
                                >
                                    Meal Planning
                                </Link>
                            </li>
                        </ul>
                    </div>

                    <div>
                        <h4 className="font-montserrat font-semibold mb-4 text-[#F7F4EF]">
                            Cities
                        </h4>
                        <ul className="space-y-2">
                            <li>
                                <button className="text-[#F7F4EF] opacity-80 hover:opacity-100 transition">
                                    Lisbon
                                </button>
                            </li>
                            <li>
                                <button className="text-[#F7F4EF] opacity-80 hover:opacity-100 transition">
                                    Barcelona
                                </button>
                            </li>
                            <li>
                                <button className="text-[#F7F4EF] opacity-80 hover:opacity-100 transition">
                                    Berlin
                                </button>
                            </li>
                            <li>
                                <button className="text-[#F7F4EF] opacity-80 hover:opacity-100 transition">
                                    Amsterdam
                                </button>
                            </li>
                            <li>
                                <button className="text-[#F7F4EF] opacity-80 hover:opacity-100 transition">
                                    London
                                </button>
                            </li>
                        </ul>
                    </div>

                    <div>
                        <h4 className="font-montserrat font-semibold mb-4 text-[#F7F4EF]">
                            Support
                        </h4>
                        <ul className="space-y-2">
                            <li>
                                <button className="text-[#F7F4EF] opacity-80 hover:opacity-100 transition">
                                    Help Center
                                </button>
                            </li>
                            <li>
                                <Link
                                    className="text-[#F7F4EF] opacity-80 hover:opacity-100 transition"
                                    href="/contact"
                                >
                                    Contact Us
                                </Link>
                            </li>
                            <li>
                                <button className="text-[#F7F4EF] opacity-80 hover:opacity-100 transition">
                                    Privacy Policy
                                </button>
                            </li>
                            <li>
                                <Link
                                    className="text-[#F7F4EF] opacity-80 hover:opacity-100 transition"
                                    href="/terms"
                                >
                                    Terms and Conditions
                                </Link>
                            </li>
                        </ul>
                    </div>
                </div>

                <div className="border-t border-[#F7F4EF] border-opacity-20 mt-8 pt-6">
                    <div className="flex justify-between items-center">
                        <p className="text-xs text-[#F7F4EF] opacity-70">
                            Copyright Cerejaperaltada Unipessoal 2025 all rights
                            reserved
                        </p>
                        <Link
                            href="/admin/login"
                            className="text-xs text-[#F7F4EF] opacity-80 hover:opacity-100 transition underline"
                        >
                            Admin
                        </Link>
                    </div>
                </div>
            </div>
        </footer>
    );
};

export default Footer;
