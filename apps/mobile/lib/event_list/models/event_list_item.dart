enum UserAttendanceStatus {
  participating,
  absent,
  pending,
  unanswered;

  static UserAttendanceStatus fromString(String value) {
    return UserAttendanceStatus.values.firstWhere(
      (e) => e.name == value,
      orElse: () => UserAttendanceStatus.unanswered,
    );
  }
}

class EventListItem {
  const EventListItem({
    required this.id,
    required this.title,
    required this.eventTypeId,
    this.eventTypeName,
    this.startDatetime,
    this.meetingDatetime,
    this.responseDeadlineDatetime,
    this.eventPlaceId,
    this.placeName,
    required this.createdAt,
    required this.updatedAt,
    required this.userAttendanceStatus,
  });

  factory EventListItem.fromJson(Map<String, dynamic> json) {
    return EventListItem(
      id: json['id'] as String,
      title: json['title'] as String,
      eventTypeId: json['eventTypeId'] as String,
      eventTypeName: json['eventTypeName'] as String?,
      startDatetime: json['startDatetime'] != null
          ? DateTime.parse(json['startDatetime'] as String)
          : null,
      meetingDatetime: json['meetingDatetime'] != null
          ? DateTime.parse(json['meetingDatetime'] as String)
          : null,
      responseDeadlineDatetime: json['responseDeadlineDatetime'] != null
          ? DateTime.parse(json['responseDeadlineDatetime'] as String)
          : null,
      eventPlaceId: json['eventPlaceId'] as String?,
      placeName: json['placeName'] as String?,
      createdAt: DateTime.parse(json['createdAt'] as String),
      updatedAt: DateTime.parse(json['updatedAt'] as String),
      userAttendanceStatus: UserAttendanceStatus.fromString(
        json['userAttendanceStatus'] as String,
      ),
    );
  }

  final String id;
  final String title;
  final String eventTypeId;
  final String? eventTypeName;
  final DateTime? startDatetime;
  final DateTime? meetingDatetime;
  final DateTime? responseDeadlineDatetime;
  final String? eventPlaceId;
  final String? placeName;
  final DateTime createdAt;
  final DateTime updatedAt;
  final UserAttendanceStatus userAttendanceStatus;
}
