import Link from "next/link";
import TopSearch from "../components/TopSearch";
import { Award, Code, Heart, Briefcase, Shield, Zap, Cloud } from "lucide-react";

export const metadata = {
  title: "Portfolio | CleanGuy Tech",
};

export default function PortfolioPage() {
  return (
    <main className="min-h-screen bg-slate-950 text-slate-100">
      <header className="border-b border-slate-700 bg-slate-900/95 backdrop-blur-md sticky top-0 z-50">
        <div className="mx-auto flex max-w-6xl flex-wrap items-center justify-between px-6 py-4 gap-4">
          <div className="flex items-center gap-3">
            <Link href="/" className="rounded-md bg-cyan-500 px-3 py-2 text-base font-bold text-slate-950 transition hover:bg-cyan-400">
              Home
            </Link>
            <h1 className="text-xl font-black text-cyan-300">CleanGuy Tech</h1>
            <span className="text-xs text-slate-400">Portfolio</span>
          </div>
          <nav className="flex items-center gap-4">
            <Link href="/guides" className="text-slate-300 hover:text-cyan-300 transition text-sm font-medium">
              Guides
            </Link>
            <Link href="/about" className="text-slate-300 hover:text-cyan-300 transition text-sm font-medium">
              About
            </Link>
            <TopSearch />
          </nav>
        </div>
      </header>

      <section className="mx-auto max-w-4xl px-6 py-20">
        {/* Hero Section */}
        <div className="text-center mb-20">
          <p className="text-sm font-semibold uppercase tracking-[0.3em] text-cyan-400">Welcome</p>
          <h1 className="mt-3 text-5xl font-bold text-cyan-100">Professional & Spiritual Portfolio</h1>
          <p className="mt-4 text-lg text-slate-300 max-w-2xl mx-auto">
            A portfolio showcasing my growth in Information Technology, cybersecurity, leadership, and service through technology.
          </p>
          <div className="mt-2 h-1 w-24 bg-linear-to-r from-cyan-500 to-blue-500 rounded-full mx-auto"></div>
          
          <div className="mt-12 flex flex-wrap justify-center gap-4">
            <button className="rounded-lg bg-linear-to-r from-cyan-500 to-blue-500 px-8 py-3 text-sm font-semibold text-white hover:from-cyan-400 hover:to-blue-400 transition-all duration-200 shadow-lg hover:shadow-cyan-500/25">
              View Projects
            </button>
            <button className="rounded-lg border border-cyan-500/50 bg-slate-900/50 px-8 py-3 text-sm font-semibold text-cyan-300 hover:bg-slate-900 hover:border-cyan-400 transition-all duration-200">
              Certifications
            </button>
          </div>
        </div>

        {/* About Me Section */}
        <div className="mb-20">
          <div className="mb-8">
            <h2 className="text-3xl font-bold text-cyan-100">About Me</h2>
            <div className="mt-2 h-1 w-16 bg-linear-to-r from-cyan-500 to-blue-500 rounded-full"></div>
          </div>
          
          <div className="rounded-2xl border border-slate-800 bg-slate-900/70 p-8 shadow-lg shadow-cyan-950/20">
            <p className="text-lg leading-8 text-slate-200">
              My name is Furkan Yildirim and I am currently studying Information Technology at Ensign College. I am interested in Cybersecurity, Troubleshooting, and Technical Support. I started CleanGuy Tech to provide technology solutions for beginners and non-technical users through simple, step-by-step guides. I believe that there is great power in providing good service via technology and I intend to grow professionally and spiritually throughout my lifetime.
            </p>
          </div>
        </div>

        {/* Guiding Principles Section */}
        <div className="mb-20">
          <div className="mb-8">
            <h2 className="text-3xl font-bold text-cyan-100">Guiding Principles</h2>
            <div className="mt-2 h-1 w-16 bg-linear-to-r from-cyan-500 to-blue-500 rounded-full"></div>
          </div>
          
          <div className="grid gap-6 md:grid-cols-3">
            <div className="rounded-2xl border border-slate-800 bg-linear-to-br from-cyan-500/10 via-slate-900/80 to-blue-500/10 p-7 hover:border-cyan-500/50 transition-all duration-300">
              <div className="flex items-center gap-3 mb-4">
                <Heart className="text-cyan-400" size={28} />
                <h3 className="text-xl font-semibold text-cyan-200">Faith and Trust in God</h3>
              </div>
              <p className="text-slate-300 leading-7">
                Prayer and belief are ways that I enforce my discipline. I will keep trying to strike the appropriate balance between my personal, work, and educational obligations, as I have learned that working in tandem with my faith and values leads me to success. Every challenge is a chance to deepen my relationship with God and mature as a person.
              </p>
            </div>

            <div className="rounded-2xl border border-slate-800 bg-linear-to-br from-cyan-500/10 via-slate-900/80 to-blue-500/10 p-7 hover:border-cyan-500/50 transition-all duration-300">
              <div className="flex items-center gap-3 mb-4">
                <Zap className="text-cyan-400" size={28} />
                <h3 className="text-xl font-semibold text-cyan-200">Service Through Technology</h3>
              </div>
              <p className="text-slate-300 leading-7">
                With CleanGuy Tech, I'm passionate about technology and want it to be accessible and easy to use. I create content to help people understand cybersecurity and how to troubleshoot their problems without needing someone else to do it for them. I do this by creating beginner-friendly troubleshooting guides, email newsletters and writing articles that empower people who are not technical in nature, so they feel confident working with technology.
              </p>
            </div>

            <div className="rounded-2xl border border-slate-800 bg-linear-to-br from-cyan-500/10 via-slate-900/80 to-blue-500/10 p-7 hover:border-cyan-500/50 transition-all duration-300">
              <div className="flex items-center gap-3 mb-4">
                <Shield className="text-cyan-400" size={28} />
                <h3 className="text-xl font-semibold text-cyan-200">Leadership Through Communication</h3>
              </div>
              <p className="text-slate-300 leading-7">
                I believe effective leadership is built on integrity, honest communication, and responsibility. In IT and cybersecurity, ethical behavior is paramount. I'm committed to leading by example, fostering teamwork, and using my technical knowledge responsibly to protect and serve others.
              </p>
            </div>
          </div>
        </div>

        {/* Projects Section */}
        <div className="mb-20">
          <div className="mb-8">
            <h2 className="text-3xl font-bold text-cyan-100">Projects</h2>
            <div className="mt-2 h-1 w-16 bg-linear-to-r from-cyan-500 to-blue-500 rounded-full"></div>
          </div>
          
          <div className="space-y-6">
            <div className="rounded-2xl border border-slate-800 bg-slate-900/60 p-8 hover:border-cyan-500/50 transition-all duration-300">
              <div className="flex items-start gap-4">
                <Briefcase className="text-cyan-400 shrink-0 mt-1" size={28} />
                <div>
                  <h3 className="text-2xl font-semibold text-cyan-200 mb-2">CleanGuy Tech</h3>
                  <p className="text-slate-300 leading-7">
                    An easy to use (user friendly) platform providing tips / solutions for common Windows and networking issues. Created as an intern project that also provides a service to help people feel more confident with technology.
                  </p>
                </div>
              </div>
            </div>

            <div className="rounded-2xl border border-slate-800 bg-slate-900/60 p-8 hover:border-cyan-500/50 transition-all duration-300">
              <div className="flex items-start gap-4">
                <Cloud className="text-cyan-400 shrink-0 mt-1" size={28} />
                <div>
                  <h3 className="text-2xl font-semibold text-cyan-200 mb-2">Azure Infrastructure Project</h3>
                  <p className="text-slate-300 leading-7">
                    This project involved building Microsoft Azure Virtual Machines, Storage, Networking Configurations, Access Control, and Learning about Cloud Infrastructure. With this experience I have developed a deeper understanding of both Cloud Computing and how to manage a Modern IT Infrastructure.
                  </p>
                </div>
              </div>
            </div>

            <div className="rounded-2xl border border-slate-800 bg-slate-900/60 p-8 hover:border-cyan-500/50 transition-all duration-300">
              <div className="flex items-start gap-4">
                <Shield className="text-cyan-400 shrink-0 mt-1" size={28} />
                <div>
                  <h3 className="text-2xl font-semibold text-cyan-200 mb-2">Wazuh IDS Project</h3>
                  <p className="text-slate-300 leading-7">
                    Configured and monitored an Intrusion Detection System to analyze both attacks and security event logs and gain practical experience in Threat Detection and Incident Response.
                  </p>
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Certifications & Skills Section */}
        <div className="mb-20">
          <div className="mb-8">
            <h2 className="text-3xl font-bold text-cyan-100">Certifications & Skills</h2>
            <div className="mt-2 h-1 w-16 bg-linear-to-r from-cyan-500 to-blue-500 rounded-full"></div>
          </div>
          
          <div className="grid gap-6 md:grid-cols-2">
            <div className="rounded-2xl border border-slate-800 bg-linear-to-br from-cyan-500/10 via-slate-900/80 to-blue-500/10 p-8">
              <div className="flex items-center gap-3 mb-6">
                <Award className="text-cyan-400" size={28} />
                <h3 className="text-2xl font-semibold text-cyan-200">Certifications</h3>
              </div>
              <ul className="space-y-3 text-sm">
                <li className="flex items-start gap-3">
                  <span className="text-cyan-400 mt-1">✓</span>
                  <div>
                    <p className="text-slate-200 font-medium">Associate of Applied Science in Information Technology</p>
                    <p className="text-slate-400 text-xs">Ensign College • 2024-2026</p>
                  </div>
                </li>
                <li className="flex items-start gap-3">
                  <span className="text-cyan-400 mt-1">✓</span>
                  <div>
                    <p className="text-slate-200 font-medium">Professionalism Certificate</p>
                    <p className="text-slate-400 text-xs">Ensign College • May 2026</p>
                  </div>
                </li>
                <li className="flex items-start gap-3">
                  <span className="text-cyan-400 mt-1">✓</span>
                  <div>
                    <p className="text-slate-200 font-medium">IT Professional</p>
                    <p className="text-slate-400 text-xs">Ensign College • October 2025</p>
                  </div>
                </li>
                <li className="flex items-start gap-3">
                  <span className="text-cyan-400 mt-1">✓</span>
                  <div>
                    <p className="text-slate-200 font-medium">Technical Support Engineer</p>
                    <p className="text-slate-400 text-xs">Ensign College • May 2025</p>
                  </div>
                </li>
                <li className="flex items-start gap-3">
                  <span className="text-cyan-400 mt-1">✓</span>
                  <div>
                    <p className="text-slate-200 font-medium">TestOut Security Pro</p>
                    <p className="text-slate-400 text-xs">CompTIA • May 2025</p>
                  </div>
                </li>
                <li className="flex items-start gap-3">
                  <span className="text-cyan-400 mt-1">✓</span>
                  <div>
                    <p className="text-slate-200 font-medium">Querying Microsoft SQL Server 2022</p>
                    <p className="text-slate-400 text-xs">LinkedIn • May 2025</p>
                  </div>
                </li>
                <li className="flex items-start gap-3">
                  <span className="text-cyan-400 mt-1">✓</span>
                  <div>
                    <p className="text-slate-200 font-medium">Network Technician Career Path</p>
                    <p className="text-slate-400 text-xs">Cisco • May 2025</p>
                  </div>
                </li>
                <li className="flex items-start gap-3">
                  <span className="text-cyan-400 mt-1">✓</span>
                  <div>
                    <p className="text-slate-200 font-medium">TestOut Hybrid Server Pro: Core</p>
                    <p className="text-slate-400 text-xs">CompTIA • June 2025</p>
                  </div>
                </li>
                <li className="flex items-start gap-3">
                  <span className="text-cyan-400 mt-1">✓</span>
                  <div>
                    <p className="text-slate-200 font-medium">PathwayConnect Certificate</p>
                    <p className="text-slate-400 text-xs">BYU-Pathway Worldwide</p>
                  </div>
                </li>
                <li className="flex items-start gap-3">
                  <span className="text-cyan-400 mt-1">✓</span>
                  <div>
                    <p className="text-slate-200 font-medium">TestOut PC Pro</p>
                    <p className="text-slate-400 text-xs">CompTIA • February 2024</p>
                  </div>
                </li>
              </ul>
            </div>

            <div className="rounded-2xl border border-slate-800 bg-linear-to-br from-cyan-500/10 via-slate-900/80 to-blue-500/10 p-8">
              <div className="flex items-center gap-3 mb-6">
                <Code className="text-cyan-400" size={28} />
                <h3 className="text-2xl font-semibold text-cyan-200">Technical Skills</h3>
              </div>
              <ul className="space-y-3">
                <li className="flex items-center gap-3">
                  <span className="text-cyan-400">▪</span>
                  <span className="text-slate-300">Windows Troubleshooting</span>
                </li>
                <li className="flex items-center gap-3">
                  <span className="text-cyan-400">▪</span>
                  <span className="text-slate-300">Networking Fundamentals</span>
                </li>
                <li className="flex items-center gap-3">
                  <span className="text-cyan-400">▪</span>
                  <span className="text-slate-300">Linux Basics</span>
                </li>
                <li className="flex items-center gap-3">
                  <span className="text-cyan-400">▪</span>
                  <span className="text-slate-300">Cybersecurity Fundamentals</span>
                </li>
                <li className="flex items-center gap-3">
                  <span className="text-cyan-400">▪</span>
                  <span className="text-slate-300">Azure Fundamentals</span>
                </li>
                <li className="flex items-center gap-3">
                  <span className="text-cyan-400">▪</span>
                  <span className="text-slate-300">Technical Documentation</span>
                </li>
              </ul>
            </div>
          </div>
        </div>

        {/* Ethical Responsibility Section */}
        <div className="mb-20">
          <div className="mb-8">
            <h2 className="text-3xl font-bold text-cyan-100">Ethical Responsibility in IT</h2>
            <div className="mt-2 h-1 w-16 bg-linear-to-r from-cyan-500 to-blue-500 rounded-full"></div>
          </div>
          
          <div className="rounded-2xl border border-cyan-500/20 bg-slate-900/50 p-8">
            <p className="text-lg leading-8 text-slate-300">
              Ethical Responsibility in IT and Cybersecurity: Ethical responsibility in the field of Information Technology and Cybersecurity is not an option but a necessity. I am totally dedicated to ensuring that user privacy and user data is secure because people place a great deal of trust in us; they trust us with their personal information.

As someone who will have administrative privileges, I understand the importance of using those privileges ethically and with integrity. I will never abuse my access or powers nor will I overstep my boundaries. Integrity is the core of my business; I believe in being honest about what I can do, being transparent in my actions, and being held accountable for my actions.

The concept of Cybersecurity responsibility is more than just defending against threats; it is to also educate others about the best practices and security awareness. Maintaining trust is also an ongoing commitment—trust takes time to earn and can be lost in an instant, so I give the same seriousness and respect to every person I interact with regardless of whether or not we differ in opinion or view.
            </p>
          </div>
        </div>

        {/* Reflection Section */}
        <div className="mb-20">
          <div className="mb-8">
            <h2 className="text-3xl font-bold text-cyan-100">Reflection</h2>
            <div className="mt-2 h-1 w-16 bg-linear-to-r from-cyan-500 to-blue-500 rounded-full"></div>
          </div>
          
          <div className="space-y-6">
            <div className="rounded-2xl border border-slate-800 bg-slate-900/70 p-8">
              <p className="text-lg leading-8 text-slate-300">
                My experience in Information Technology has changed me personally and professionally. I have learned that to develop as a person requires both discipline and consistency; by showing up each day, no matter how little progress you see, can lead to great accomplishments through time. My faith has also shown me that success is not just a goal; rather, it is about the individual I become while achieving it. Each project, certification, and tutorial I build is an opportunity for me to develop as both a technician and a leader. The most rewarding way for me to contribute to those around me is by providing them with technical assistance so that they can use their computer/technological devices and feel supported when doing so.
              </p>
            </div>

            <div className="rounded-2xl border border-slate-800 bg-slate-900/70 p-8">
              <p className="text-lg leading-8 text-slate-300">
                Prioritization and trust are essential lessons I've learned through balancing my education, career goals, and faith. Even though it is impossible to succeed in every area all at once, I can still be purposeful with how I use my time and energy. The journey of developing as a leader has taught me that authentic leadership with real influence is more about being honest and caring about the development of others than anything else. I am committed to continuing on my path to be excellent at what I do professionally and develop spiritually because I believe that by using technology to serve others, I am part of something more significant than just myself. Exciting possibilities lie ahead, and I cannot wait to see where this journey takes me.
              </p>
            </div>
          </div>
        </div>

        {/* Footer Quote */}
        <div className="mb-16 text-center">
          <div className="rounded-2xl border border-cyan-500/30 bg-linear-to-r from-cyan-500/5 to-blue-500/5 p-12">
            <p className="text-2xl font-semibold italic text-cyan-100">
              "Technology becomes more meaningful when it is used to serve and help others."
            </p>
          </div>
        </div>

        {/* CTA Section */}
        <div className="text-center">
          <Link
            href="/guides"
            className="inline-block rounded-lg bg-linear-to-r from-cyan-500 to-blue-500 px-8 py-3 text-sm font-semibold text-white hover:from-cyan-400 hover:to-blue-400 transition-all duration-200 shadow-lg hover:shadow-cyan-500/25"
          >
            Explore Guides →
          </Link>
        </div>
      </section>

      <section className="border-t border-slate-800 bg-slate-950">
        <div className="mx-auto max-w-5xl px-6 py-16 text-center text-sm text-slate-400">
          <p>© {new Date().getFullYear()} CleanGuy Tech — Technology for everyone.</p>
          <p className="mt-2 text-xs text-slate-500">Built with integrity, service, and faith.</p>
        </div>
      </section>
    </main>
  );
}
