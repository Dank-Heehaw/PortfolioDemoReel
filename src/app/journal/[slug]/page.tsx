import type { Metadata } from "next";
import { notFound } from "next/navigation";
import { JournalPostView } from "@/components/views/JournalPostView";
import { RevealArticle } from "@/components/motion/PageMotion";
import { getJournalPost, getOnSiteJournalPosts } from "@/lib/journal";

// /journal/[slug]  — only on-site posts. External articles stay as outbound links.

type JournalPostPageProps = PageProps<"/journal/[slug]">;

export function generateStaticParams() {
  return getOnSiteJournalPosts().map((post) => ({ slug: post.slug }));
}

export async function generateMetadata({ params }: JournalPostPageProps): Promise<Metadata> {
  const { slug } = await params;
  const post = getJournalPost(slug);
  if (!post || post.externalUrl) return { title: "Journal" };
  return { title: post.title, description: post.summary };
}

export default async function JournalPostPage({ params }: JournalPostPageProps) {
  const { slug } = await params;
  const post = getJournalPost(slug);
  if (!post || post.externalUrl) notFound();

  return (
    <RevealArticle>
      <JournalPostView post={post} />
    </RevealArticle>
  );
}
