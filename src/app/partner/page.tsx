export default function PartnerPage() {
    return (
        <div className="container-custom py-10">
            <div className="text-center mb-12">
                <h1 className="text-4xl font-bold text-primary mb-4">Partner with Job Openings Kenya</h1>
                <p className="text-xl text-gray-600 max-w-2xl mx-auto">
                    Join us in empowering the next generation of African leaders. Together, we can create lasting impact.
                </p>
            </div>

            <div className="grid md:grid-cols-3 gap-6 mb-12">
                <div className="card bg-base-100 shadow-xl border-t-4 border-primary">
                    <div className="card-body text-center">
                        <div className="text-4xl mb-3">💼</div>
                        <h3 className="card-title justify-center mb-2">Post Opportunities</h3>
                        <p className="text-gray-600">Share job openings, internships, and trainings with our engaged community of young professionals.</p>
                    </div>
                </div>
                <div className="card bg-base-100 shadow-xl border-t-4 border-secondary">
                    <div className="card-body text-center">
                        <div className="text-4xl mb-3">📚</div>
                        <h3 className="card-title justify-center mb-2">Sponsor Training</h3>
                        <p className="text-gray-600">Fund skills development programs and help youth gain the competencies needed for your industry.</p>
                    </div>
                </div>
                <div className="card bg-base-100 shadow-xl border-t-4 border-accent">
                    <div className="card-body text-center">
                        <div className="text-4xl mb-3">🤝</div>
                        <h3 className="card-title justify-center mb-2">Mentorship</h3>
                        <p className="text-gray-600">Guide young professionals through career development and industry insights.</p>
                    </div>
                </div>
            </div>

            <div className="card bg-base-100 shadow-xl max-w-2xl mx-auto">
                <div className="card-body">
                    <h2 className="text-2xl font-bold mb-6 text-center">Get in Touch</h2>
                    <form className="space-y-4">
                        <div className="form-control">
                            <label className="label">
                                <span className="label-text font-semibold">Organization Name</span>
                            </label>
                            <input type="text" placeholder="Your organization" className="input input-bordered w-full" required />
                        </div>
                        <div className="grid md:grid-cols-2 gap-4">
                            <div className="form-control">
                                <label className="label">
                                    <span className="label-text font-semibold">Contact Name</span>
                                </label>
                                <input type="text" placeholder="e.g., Wanjiku Kamau" className="input input-bordered w-full" required />
                            </div>
                            <div className="form-control">
                                <label className="label">
                                    <span className="label-text font-semibold">Email</span>
                                </label>
                                <input type="email" placeholder="hello@company.com" className="input input-bordered w-full" required />
                            </div>
                        </div>
                        <div className="form-control">
                            <label className="label">
                                <span className="label-text font-semibold">Partnership Interest</span>
                            </label>
                            <select className="select select-bordered w-full" required>
                                <option disabled selected>Select partnership type</option>
                                <option>Post Opportunities</option>
                                <option>Sponsor Training</option>
                                <option>Grant Support</option>
                                <option>Other</option>
                            </select>
                        </div>
                        <div className="form-control">
                            <label className="label">
                                <span className="label-text font-semibold">Message</span>
                            </label>
                            <textarea className="textarea textarea-bordered h-32" placeholder="Tell us about your partnership goals..." required></textarea>
                        </div>
                        <button type="submit" className="inline-flex items-center justify-center w-full bg-[#5CB800] hover:bg-[#4A9900] text-white px-6 py-3 text-lg rounded-xl font-bold">Submit Partnership Inquiry</button>
                    </form>
                </div>
            </div>
        </div>
    );
}
