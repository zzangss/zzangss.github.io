export interface ProtectedPost {
  id: string;
  protected: true;
  data: {
    title: string;
    description: string;
    pubDate: Date;
    tags: string[];
  };
}

export const protectedPosts: ProtectedPost[] = [
  {
    id: "bookkiki-redis-streams",
    protected: true,
    data: {
      title: "Bookkiki는 Redis를 어떻게 사용하고 있을까?",
      description: "비밀번호로 보호된 Redis Streams 적용 기록입니다.",
      pubDate: new Date("2026-08-18T00:00:00+09:00"),
      tags: ["bookkiki", "redis", "architecture"]
    }
  }
];
