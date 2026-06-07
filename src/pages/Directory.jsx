import React, { useState, useEffect, useMemo } from 'react';
import styled from 'styled-components';
import { jwtDecode } from 'jwt-decode';
import ProfileCard from '../components/ProfileCard';
import BrandedLoader from '../components/BrandedLoader';
import useMinimumLoadingDelay from '../hooks/useMinimumLoadingDelay';
import { getStoredAuthToken } from '../utils/auth';

const DirectoryHeader = styled.div`
  display: flex;
  flex-direction: column;
  gap: 1rem;
  margin-bottom: 2rem;

  @media (min-width: 768px) {
    flex-direction: row;
    align-items: center;
    justify-content: space-between;
  }
`;

const DirectoryContainer = styled.div`
  display: grid;
  grid-template-columns: repeat(auto-fill, minmax(200px, 1fr));
  gap: 1.5rem;
`;

const PageTitle = styled.h1`
  font-size: 2rem;
  font-weight: 700;
  color: #2c3e50;
`;

const Subtitle = styled.p`
  color: #6b7a90;
  margin: 0;
`;

const SearchInput = styled.input`
  padding: 0.75rem 1rem;
  border-radius: 12px;
  border: 1px solid #dfe6ee;
  font-size: 0.95rem;
  width: 100%;
  max-width: 320px;
  outline: none;
  background: white;

  &:focus {
    border-color: var(--primary-teal);
    box-shadow: 0 0 0 3px rgba(26, 188, 156, 0.12);
  }
`;

const EmptyState = styled.div`
  padding: 2rem;
  border-radius: 16px;
  background: white;
  box-shadow: var(--shadow);
  color: #6b7a90;
  text-align: center;
`;

const Directory = () => {
  const [students, setStudents] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [query, setQuery] = useState('');
  const showLoader = useMinimumLoadingDelay(loading, 500);
  const viewerId = useMemo(() => {
    const token = getStoredAuthToken();
    if (!token) return null;
    try {
      const decoded = jwtDecode(token);
      return decoded?.id ?? null;
    } catch {
      return null;
    }
  }, []);

  useEffect(() => {
    const fetchStudents = async () => {
      let timeoutId;
      try {
        const controller = new AbortController();
        timeoutId = setTimeout(() => controller.abort(), 8000);

        const response = await fetch('/api/students', { signal: controller.signal });
        if (!response.ok) {
          const errorText = await response.text();
          throw new Error(errorText || 'Network response was not ok');
        }
        const contentType = response.headers.get('content-type');
        const data = contentType && contentType.includes('application/json')
          ? await response.json()
          : [];
        setStudents(data);
      } catch (error) {
        if (error.name === 'AbortError') {
          setError('Request timed out. Is the server running?');
        } else {
          setError(error.message);
        }
      } finally {
        if (timeoutId) {
          clearTimeout(timeoutId);
        }
        setLoading(false);
      }
    };

    fetchStudents();
  }, []);

  const filteredStudents = useMemo(() => {
    const getFirstName = (fullName = '') => {
      const parts = fullName.trim().split(/\s+/).filter(Boolean);
      return parts.length > 0 ? parts[0].toLowerCase() : '';
    };

    const normalized = query.trim().toLowerCase();
    const list = normalized
      ? students.filter((student) => {
          const name = (student.name || '').toLowerCase();
          const email = (student.email || '').toLowerCase();
          const about = (student.about_me || '').toLowerCase();
          return name.includes(normalized) || email.includes(normalized) || about.includes(normalized);
        })
      : students;

    return [...list].sort((a, b) => {
      const aAdmin = a.role === 'admin' ? 1 : 0;
      const bAdmin = b.role === 'admin' ? 1 : 0;
      if (aAdmin !== bAdmin) return bAdmin - aAdmin;

      const aFirst = getFirstName(a.name || '');
      const bFirst = getFirstName(b.name || '');
      const firstNameCompare = aFirst.localeCompare(bFirst);
      if (firstNameCompare !== 0) return firstNameCompare;

      return (a.name || '').localeCompare(b.name || '');
    });
  }, [students, query]);

  if (showLoader) return <BrandedLoader message="Loading classroom..." minHeight="60vh" />;
  if (error) return <p>Error loading classroom: {error}</p>;

  return (
    <>
      <DirectoryHeader>
        <div>
          <PageTitle>Classroom Directory</PageTitle>
          <Subtitle>{filteredStudents.length} students</Subtitle>
        </div>
        <SearchInput
          type="search"
          placeholder="Search by name, email, or about"
          value={query}
          onChange={(e) => setQuery(e.target.value)}
        />
      </DirectoryHeader>

      {filteredStudents.length === 0 ? (
        <EmptyState>No students found. Try clearing the search.</EmptyState>
      ) : (
          <DirectoryContainer>
          {filteredStudents.map((student) => (
            <ProfileCard key={student.id} student={student} viewerId={viewerId} />
          ))}
        </DirectoryContainer>
      )}
    </>
  );
};

export default Directory;
