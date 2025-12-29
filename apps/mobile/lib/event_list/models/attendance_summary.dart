class AttendanceSummary {
  const AttendanceSummary({
    required this.userId,
    required this.status,
  });

  factory AttendanceSummary.fromJson(Map<String, dynamic> json) {
    return AttendanceSummary(
      userId: json['userId'] as String,
      status: AttendanceSummaryStatus.fromString(json['status'] as String),
    );
  }

  final String userId;
  final AttendanceSummaryStatus status;
}

enum AttendanceSummaryStatus {
  attending,
  notAttending,
  pending;

  static AttendanceSummaryStatus fromString(String value) {
    switch (value) {
      case 'attending':
        return AttendanceSummaryStatus.attending;
      case 'not_attending':
        return AttendanceSummaryStatus.notAttending;
      case 'pending':
        return AttendanceSummaryStatus.pending;
      default:
        return AttendanceSummaryStatus.pending;
    }
  }
}
