"use client";

import { useEffect } from "react";
import { useRouter } from "next/navigation";

/**
 * Root page - redirects to login
 * This is the landing page that redirects users to the appropriate dashboard or login
 */
export default function Home() {
  const router = useRouter();

  useEffect(() => {
    // Redirect to login page
    // The login page will handle redirecting authenticated users to their dashboard
    router.push('/login');
  }, [router]);

  // Show loading while redirecting
  return (
    <div style={{
      display: 'flex',
      justifyContent: 'center',
      alignItems: 'center',
      minHeight: '100vh',
      backgroundColor: '#f5f5f5',
      fontFamily: 'system-ui, -apple-system, sans-serif'
    }}>
      <div style={{ textAlign: 'center' }}>
        <h1 style={{ 
          fontSize: '24px', 
          marginBottom: '16px',
          color: '#333'
        }}>
          Geospatial Dental Modeler
        </h1>
        <p style={{ color: '#666', marginBottom: '24px' }}>Loading application...</p>
        <div style={{
          width: '40px',
          height: '40px',
          margin: '0 auto',
          border: '4px solid #f3f3f3',
          borderTop: '4px solid #3498db',
          borderRadius: '50%',
          animation: 'spin 1s linear infinite'
        }} />
        <style jsx>{`
          @keyframes spin {
            0% { transform: rotate(0deg); }
            100% { transform: rotate(360deg); }
          }
        `}</style>
      </div>
    </div>
  );
}
