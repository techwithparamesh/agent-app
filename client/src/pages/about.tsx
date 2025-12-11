import { Navbar } from "@/components/navbar";
import { Footer } from "@/components/footer";
import { Badge } from "@/components/ui/badge";
import { Card, CardContent } from "@/components/ui/card";
import { Target, Eye, Heart, Users } from "lucide-react";

const values = [
	{
		icon: Target,
		title: "Innovation First",
		description:
			"We push the boundaries of AI technology to create tools that truly make a difference.",
	},
	{
		icon: Eye,
		title: "Transparency",
		description: "We believe in clear communication and honest practices with our customers.",
	},
	{
		icon: Heart,
		title: "Customer Focus",
		description: "Every feature we build starts with understanding our customers' needs.",
	},
	{
		icon: Users,
		title: "Collaboration",
		description: "We work together as a team and with our community to achieve great things.",
	},
];

const team = [
	{
		name: "Parameswar Reddy",
		role: "CEO & Founder",
		bio: "Visionary leader driving innovation and growth.",
		initials: "PR",
	},
	{
		name: "Nagabhushan Reddy",
		role: "Co-Founder",
		bio: "Strategic partner and technology expert.",
		initials: "NR",
	},
	{
		name: "Rajasekhar Babu",
		role: "Marketing Strategist",
		bio: "Expert in marketing strategy and analytics.",
		initials: "RB",
	},
	{
		name: "Parameswar Reddy",
		role: "Product Owner",
		bio: "Product owner ensuring user-centric development.",
		initials: "PR",
	},
];

export default function About() {
	return (
		<div className="min-h-screen bg-background">
			<Navbar />

			<main className="pt-16">
				{/* Hero Section */}
				<section className="py-24 bg-gradient-to-b from-muted/50 to-background">
					<div className="container mx-auto max-w-7xl px-6">
						<div className="max-w-3xl mx-auto text-center">
							<Badge variant="secondary" className="mb-6">
								About Us
							</Badge>
							<h1
								className="font-display text-4xl md:text-5xl font-bold tracking-tight mb-6"
								data-testid="text-about-title"
							>
								Building the Future of
								<span className="block text-primary">AI-Powered Interactions</span>
							</h1>
							<p className="text-lg text-muted-foreground leading-relaxed">
								We're on a mission to democratize AI technology, making it accessible for
								businesses of all sizes to create intelligent, engaging customer experiences.
							</p>
						</div>
					</div>
				</section>

				{/* Mission & Vision */}
				<section className="py-24">
					<div className="container mx-auto max-w-7xl px-6">
						<div className="grid grid-cols-1 md:grid-cols-2 gap-12">
							<Card>
								<CardContent className="p-8">
									<div className="w-12 h-12 rounded-lg bg-primary/10 flex items-center justify-center mb-6">
										<Target className="h-6 w-6 text-primary" />
									</div>
									<h2 className="font-display text-2xl font-bold mb-4">
										Our Mission
									</h2>
									<p className="text-muted-foreground leading-relaxed">
										To empower every business with AI agents that understand their unique
										context, enabling meaningful conversations and automated workflows that
										drive growth.
									</p>
								</CardContent>
							</Card>

							<Card>
								<CardContent className="p-8">
									<div className="w-12 h-12 rounded-lg bg-primary/10 flex items-center justify-center mb-6">
										<Eye className="h-6 w-6 text-primary" />
									</div>
									<h2 className="font-display text-2xl font-bold mb-4">Our Vision</h2>
									<p className="text-muted-foreground leading-relaxed">
										A world where AI agents seamlessly integrate into every business,
										handling routine tasks while humans focus on creativity, strategy, and
										building relationships.
									</p>
								</CardContent>
							</Card>
						</div>
					</div>
				</section>

				{/* Why We Built This */}
				<section className="py-24 bg-muted/30">
					<div className="container mx-auto max-w-7xl px-6">
						<div className="max-w-3xl mx-auto">
							<Badge variant="secondary" className="mb-6">
								Our Story
							</Badge>
							<h2 className="font-display text-3xl md:text-4xl font-bold tracking-tight mb-8">
								Why We Built AgentForge
							</h2>
							<div className="prose prose-lg dark:prose-invert">
								<p className="text-muted-foreground leading-relaxed mb-6">
									We started AgentForge after experiencing firsthand the challenges of
									building AI-powered customer interactions. As engineers and product
									builders, we saw that creating intelligent chatbots and automation tools
									required extensive technical expertise and months of development time.
								</p>
								<p className="text-muted-foreground leading-relaxed mb-6">
									We believed there had to be a better way. What if any business could
									deploy an AI agent that truly understood their products, services, and
									customers - without writing a single line of code?
								</p>
								<p className="text-muted-foreground leading-relaxed">
									That question led us to build AgentForge: a platform that combines the
									latest advances in AI with an intuitive interface, making it possible
									for anyone to create sophisticated AI agents in minutes, not months.
								</p>
							</div>
						</div>
					</div>
				</section>

				{/* Our Values */}
				<section className="py-24">
					<div className="container mx-auto max-w-7xl px-6">
						<div className="text-center mb-16">
							<Badge variant="secondary" className="mb-4">
								Our Values
							</Badge>
							<h2 className="font-display text-3xl md:text-4xl font-bold tracking-tight">
								What Drives Us
							</h2>
						</div>

						<div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
							{values.map((value, index) => (
								<Card key={index}>
									<CardContent className="p-6 text-center">
										<div className="w-12 h-12 rounded-lg bg-primary/10 flex items-center justify-center mx-auto mb-4">
											{value.icon({ className: "h-6 w-6 text-primary" })}
										</div>
										<h3 className="font-semibold text-lg mb-2">{value.title}</h3>
										<p className="text-sm text-muted-foreground">
											{value.description}
										</p>
									</CardContent>
								</Card>
							))}
						</div>
					</div>
				</section>

				{/* Team Section */}
				<section className="py-24 bg-muted/30">
					<div className="container mx-auto max-w-7xl px-6">
						<div className="text-center mb-16">
							<Badge variant="secondary" className="mb-4">
								Our Team
							</Badge>
							<h2 className="font-display text-3xl md:text-4xl font-bold tracking-tight mb-4">
								Meet the People Behind AgentForge
							</h2>
							<p className="text-muted-foreground max-w-2xl mx-auto">
								A diverse team of engineers, researchers, and product experts passionate
								about AI.
							</p>
						</div>

						<div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
							{team.map((member, index) => (
								<Card key={index}>
									<CardContent className="p-6 text-center">
										<div className="w-20 h-20 rounded-full bg-gradient-to-br from-primary to-chart-3 flex items-center justify-center mx-auto mb-4">
											<span className="text-2xl font-bold text-white">
												{member.initials}
											</span>
										</div>
										<h3 className="font-semibold text-lg">{member.name}</h3>
										<p className="text-sm text-primary mb-2">{member.role}</p>
										<p className="text-sm text-muted-foreground">
											{member.bio}
										</p>
									</CardContent>
								</Card>
							))}
						</div>
					</div>
				</section>
			</main>

			<Footer />
		</div>
	);
}
