import Link from 'next/link';

export default function ConfirmationPage({
  searchParams,
}: {
  searchParams: { type?: string };
}) {
  const isAnonymous = searchParams.type === 'anonymous';

  return (
    <main className="min-h-screen bg-white flex items-center justify-center px-4">
      <div className="max-w-md w-full text-center">
        <div className="text-4xl mb-6">✨</div>
        <h1 className="text-2xl font-bold tracking-tight text-gray-900 mb-4">
          You&apos;re in the queue.
        </h1>
        <p className="text-gray-500 leading-relaxed mb-10">
          {isAnonymous
            ? "Sophie will send you the post draft before it goes live. If someone reaches out after the post, she'll ask you before making any introduction."
            : 'Sophie will send you a draft to review before she posts anything.'}
        </p>
        <a
          href="https://www.linkedin.com/in/sophiepages/"
          target="_blank"
          rel="noopener noreferrer"
          className="inline-block bg-gray-900 text-white px-6 py-3 rounded-lg text-sm font-medium hover:bg-gray-800 transition"
        >
          Follow Sophie on LinkedIn
        </a>
        <div className="mt-8">
          <Link
            href="/"
            className="text-sm text-gray-400 hover:text-gray-600 transition"
          >
            Submit another request
          </Link>
        </div>
      </div>
    </main>
  );
}
