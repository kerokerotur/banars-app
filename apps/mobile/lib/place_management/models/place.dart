class Place {
  final String id;
  final String name;
  final String googleMapsUrlNormalized;
  final DateTime createdAt;

  const Place({
    required this.id,
    required this.name,
    required this.googleMapsUrlNormalized,
    required this.createdAt,
  });

  factory Place.fromJson(Map<String, dynamic> json) {
    return Place(
      id: json['id'] as String,
      name: json['name'] as String,
      googleMapsUrlNormalized: json['google_maps_url_normalized'] as String,
      createdAt: DateTime.parse(json['created_at'] as String),
    );
  }

  Map<String, dynamic> toJson() {
    return {
      'id': id,
      'name': name,
      'google_maps_url_normalized': googleMapsUrlNormalized,
      'created_at': createdAt.toIso8601String(),
    };
  }

  Place copyWith({
    String? id,
    String? name,
    String? googleMapsUrl,
    DateTime? createdAt,
  }) {
    return Place(
      id: id ?? this.id,
      name: name ?? this.name,
      googleMapsUrlNormalized:
          googleMapsUrlNormalized ?? this.googleMapsUrlNormalized,
      createdAt: createdAt ?? this.createdAt,
    );
  }
}
