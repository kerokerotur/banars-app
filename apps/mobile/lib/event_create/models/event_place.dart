class EventPlace {
  const EventPlace({
    required this.id,
    required this.name,
    required this.googleMapsUrl,
    required this.createdAt,
    this.createdUser,
    required this.updatedAt,
    this.updatedUser,
  });

  factory EventPlace.fromJson(Map<String, dynamic> json) {
    return EventPlace(
      id: json['id'] as String,
      name: json['name'] as String,
      googleMapsUrl: json['google_maps_url_normalized'] as String,
      createdAt: DateTime.parse(json['created_at'] as String),
      createdUser: json['created_user'] as String?,
      updatedAt: DateTime.parse(json['updated_at'] as String),
      updatedUser: json['updated_user'] as String?,
    );
  }

  final String id;
  final String name;
  final String googleMapsUrl; // DBカラム名: google_maps_url_normalized
  final DateTime createdAt;
  final String? createdUser;
  final DateTime updatedAt;
  final String? updatedUser;
}
