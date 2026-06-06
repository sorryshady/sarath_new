export function StudioSetup() {
  return (
    <main
      style={{
        minHeight: '100vh',
        padding: '3rem 2rem',
        fontFamily: 'system-ui, sans-serif',
        background: '#111',
        color: '#f9f6f0',
        lineHeight: 1.6,
      }}
    >
      <h1 style={{ fontSize: '1.5rem', marginBottom: '1rem' }}>
        Sanity Studio — setup required
      </h1>
      <p style={{ maxWidth: '40rem', marginBottom: '1.5rem', opacity: 0.85 }}>
        <code>NEXT_PUBLIC_SANITY_PROJECT_ID</code> is missing or empty in{' '}
        <code>.env.local</code>. The Studio needs a real Sanity project ID to
        load.
      </p>
      <ol style={{ maxWidth: '40rem', paddingLeft: '1.25rem', opacity: 0.9 }}>
        <li style={{ marginBottom: '0.75rem' }}>
          Create or connect a project:{' '}
          <code style={{ background: '#222', padding: '0.15rem 0.4rem' }}>
            npx sanity@latest init
          </code>
        </li>
        <li style={{ marginBottom: '0.75rem' }}>
          Copy your project ID from{' '}
          <a
            href="https://sanity.io/manage"
            style={{ color: '#efd9b6' }}
            target="_blank"
            rel="noopener noreferrer"
          >
            sanity.io/manage
          </a>
        </li>
        <li>
          Add it to <code>.env.local</code>:
          <pre
            style={{
              marginTop: '0.75rem',
              padding: '1rem',
              background: '#1a1a1a',
              borderRadius: '6px',
              overflow: 'auto',
            }}
          >
            {`NEXT_PUBLIC_SANITY_PROJECT_ID=your_project_id_here
NEXT_PUBLIC_SANITY_DATASET=production`}
          </pre>
        </li>
      </ol>
      <p style={{ marginTop: '1.5rem', opacity: 0.7, fontSize: '0.9rem' }}>
        Restart <code>npm run dev</code> after saving <code>.env.local</code>.
      </p>
    </main>
  );
}
