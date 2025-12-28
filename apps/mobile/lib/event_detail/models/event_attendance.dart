enum EventAttendanceStatus {
  attending,
  notAttending,
  pending,
}

class EventAttendance {
  const EventAttendance({
    required this.id,
    required this.memberId,
    this.displayName,
    this.avatarUrl,
    required this.status,
    this.comment,
    required this.updatedAt,
  });

  factory EventAttendance.fromJson(Map<String, dynamic> json) {
    return EventAttendance(
      id: json['id'] as String,
      memberId: json['memberId'] as String,
      displayName: json['displayName'] as String?,
      avatarUrl: json['avatarUrl'] as String?,
      status: _statusFromString(json['status'] as String?),
      comment: json['comment'] as String?,
      updatedAt: DateTime.parse(json['updatedAt'] as String),
    );
  }

  final String id;
  final String memberId;
  final String? displayName;
  final String? avatarUrl;
  final EventAttendanceStatus status;
  final String? comment;
  final DateTime updatedAt;
}

EventAttendanceStatus _statusFromString(String? value) {
  switch (value) {
    case 'attending':
      return EventAttendanceStatus.attending;
    case 'not_attending':
      return EventAttendanceStatus.notAttending;
    case 'pending':
    default:
      return EventAttendanceStatus.pending;
  }
}
