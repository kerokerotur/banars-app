class EventPlace {
  const EventPlace({
    required this.id,
    required this.name,
    required this.address,
    this.latitude,
    this.longitude,
    this.osmId,
    this.osmType,
  });

  factory EventPlace.fromJson(Map<String, dynamic> json) {
    return EventPlace(
      id: json['id'] as String,
      name: json['name'] as String,
      address: json['address'] as String,
      latitude: json['latitude'] as double?,
      longitude: json['longitude'] as double?,
      osmId: json['osm_id'] as int?,
      osmType: json['osm_type'] as String?,
    );
  }

  final String id;
  final String name;
  final String address;
  final double? latitude;
  final double? longitude;
  final int? osmId;
  final String? osmType;
}
