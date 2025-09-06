export type BlogPageProps = {
  children: React.ReactNode;
};

export default function BlogPage({ children }: BlogPageProps) {
  return <div>{children}</div>;
}
