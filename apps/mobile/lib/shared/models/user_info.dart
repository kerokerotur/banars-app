class UserInfo {
  const UserInfo({
    required this.userId,
    required this.displayName,
    this.avatarUrl,
    required this.status,
    this.lastLoginDatetime,
    this.role,
    required this.createdAt,
  });

  factory UserInfo.fromJson(Map<String, dynamic> json) {
    return UserInfo(
      userId: json['userId'] as String,
      displayName: json['displayName'] as String,
      avatarUrl: json['avatarUrl'] as String?,
      status: json['status'] as String,
      lastLoginDatetime: json['lastLoginDatetime'] != null
          ? DateTime.parse(json['lastLoginDatetime'] as String)
          : null,
      role: json['role'] as String?,
      createdAt: DateTime.parse(json['createdAt'] as String),
    );
  }

  final String userId;
  final String displayName;
  final String? avatarUrl;
  final String status;
  final DateTime? lastLoginDatetime;
  final String? role;
  final DateTime createdAt;
}
