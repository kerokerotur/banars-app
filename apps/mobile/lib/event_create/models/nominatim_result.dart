class NominatimResult {
  const NominatimResult({
    required this.placeId,
    required this.displayName,
    required this.lat,
    required this.lon,
    this.osmId,
    this.osmType,
    this.address,
  });

  factory NominatimResult.fromJson(Map<String, dynamic> json) {
    double parseLatLon(dynamic value) {
      if (value is num) return value.toDouble();
      if (value is String) return double.parse(value);
      throw FormatException('invalid lat/lon');
    }

    return NominatimResult(
      placeId: json['place_id'] as int,
      displayName: json['display_name'] as String,
      lat: parseLatLon(json['lat']),
      lon: parseLatLon(json['lon']),
      osmId: json['osm_id'] as int?,
      osmType: json['osm_type'] as String?,
      address: json['address'] as Map<String, dynamic>?,
    );
  }

  final int placeId;
  final String displayName;
  final double lat;
  final double lon;
  final int? osmId;
  final String? osmType;
  final Map<String, dynamic>? address;

  String get formattedName {
    // Extract venue name from address or use first part of display_name
    if (address != null) {
      final venue = address!['stadium'] ??
          address!['building'] ??
          address!['amenity'] ??
          address!['leisure'];
      if (venue != null) return venue as String;
    }
    return displayName.split(',').first;
  }
}
