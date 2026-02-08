import { useQuery } from "@tanstack/react-query";
import { getUserList } from "@/services/users.service";

export const MemberListPage = () => {
  const { data: members, isLoading, error } = useQuery({
    queryKey: ["users", "list"],
    queryFn: getUserList,
  });

  if (isLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-light-background dark:bg-dark-background">
        <div className="flex flex-col items-center gap-4">
          <div className="animate-spin text-4xl">⏳</div>
          <p className="text-light-text-secondary dark:text-dark-text-secondary">
            メンバーを読み込み中...
          </p>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-light-background dark:bg-dark-background px-4">
        <div className="max-w-md w-full">
          <div className="bg-red-50 border border-red-200 rounded-lg p-4">
            <p className="text-red-800 text-sm">
              {error instanceof Error
                ? error.message
                : "メンバーの読み込みに失敗しました"}
            </p>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-light-background dark:bg-dark-background">
      <div className="max-w-2xl mx-auto px-4 py-6">
        <h1 className="text-2xl font-bold text-light-text-primary dark:text-dark-text-primary mb-6">
          メンバー一覧
        </h1>

        {members && members.length > 0 ? (
          <div className="space-y-3">
            {members.map((member) => (
              <div
                key={member.userId}
                className="bg-light-surface dark:bg-dark-surface rounded-lg p-4 shadow-sm border border-light-divider dark:border-dark-divider flex items-center gap-4"
              >
                {/* アバター */}
                <div className="w-12 h-12 rounded-full bg-light-surface-container dark:bg-dark-surface-container flex items-center justify-center overflow-hidden flex-shrink-0">
                  {member.avatarUrl ? (
                    <img
                      src={member.avatarUrl}
                      alt={member.displayName}
                      className="w-full h-full object-cover"
                    />
                  ) : (
                    <span className="text-light-text-secondary dark:text-dark-text-secondary text-2xl">
                      👤
                    </span>
                  )}
                </div>

                {/* 名前とロール */}
                <div className="flex-1 min-w-0">
                  <p className="text-light-text-primary dark:text-dark-text-primary font-medium">
                    {member.displayName}
                  </p>
                  <p className="text-sm text-light-text-secondary dark:text-dark-text-secondary">
                    {member.role === "manager" ? "運営" : "メンバー"}
                  </p>
                </div>
              </div>
            ))}
          </div>
        ) : (
          <div className="text-center py-12">
            <p className="text-light-text-secondary dark:text-dark-text-secondary">
              メンバーがいません
            </p>
          </div>
        )}
      </div>
    </div>
  );
};
