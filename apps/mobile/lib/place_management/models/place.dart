class Place {
  final String id;
  final String name;
  final String googleMapsUrl;
  final DateTime createdAt;

  const Place({
    required this.id,
    required this.name,
    required this.googleMapsUrl,
    required this.createdAt,
  });

  factory Place.fromJson(Map<String, dynamic> json) {
    return Place(
      id: json['id'] as String,
      name: json['name'] as String,
      googleMapsUrl: json['google_maps_url'] as String,
      createdAt: DateTime.parse(json['created_at'] as String),
    );
  }

  Map<String, dynamic> toJson() {
    return {
      'id': id,
      'name': name,
      'google_maps_url': googleMapsUrl,
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
      googleMapsUrl: googleMapsUrl ?? this.googleMapsUrl,
      createdAt: createdAt ?? this.createdAt,
    );
  }
}
