from celestial.bodycatalog import get_celestial_body, list_celestial_bodies


def test_body_catalog_includes_sun():
    bodies = list_celestial_bodies()
    body_ids = {str(item.get("body_id") or "").strip().lower() for item in bodies}
    assert "sun" in body_ids
    for dwarf in ("ceres", "pluto", "haumea", "makemake", "eris"):
        assert dwarf in body_ids

    sun = get_celestial_body("sun")
    assert sun is not None
    assert sun.get("name") == "Sun"
    assert sun.get("body_type") == "star"

    pluto = get_celestial_body("pluto")
    assert pluto is not None
    assert pluto.get("body_type") == "dwarf"
