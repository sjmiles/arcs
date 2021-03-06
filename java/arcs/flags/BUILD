load(
    "//third_party/java/arcs/build_defs:build_defs.bzl",
    "arcs_java_library",
    "arcs_kt_library",
)
load("//third_party/java/arcs/flags:flags.bzl", "ARCS_BUILD_FLAGS")
load(
    "//third_party/java/arcs/flags:generate_build_flags.bzl",
    "generate_build_flags",
)

licenses(["notice"])

arcs_kt_library(
    name = "flags",
    srcs = glob(
        ["*.kt"],
        exclude = ["DevModeBuildFlags.kt"],
    ),
    visibility = ["//java/arcs:arcs-internal"],
    exports = [
        ":build_flags",
    ],
)

arcs_kt_library(
    name = "DevModeBuildFlags",
    srcs = ["DevModeBuildFlags.kt"],
    visibility = ["//java/arcs:allowed-packages-tools"],
)

# Default generated build flags, for use in Arcs libraries. This is marked
# "neverlink", which means it is used when compiling libraries, but is not
# linked into the final binary. Every Android binary must link in its own
# generated BuildFlags class.
#
# Using a Java library instead of a Kotlin library so we can use neverlink.
#
# Code should prefer to dep on the :flags target instead, which re-exports this.
arcs_java_library(
    name = "build_flags",
    constraints = ["android"],
    neverlink = True,
    visibility = ["//java/arcs:arcs-internal"],
    exports = [":build_flags_kt"],
)

# Generates a BuildFlags library that can be compiled and linked in unit tests.
# Unit tests should prefer to dep on the testing subpackage instead, which
# re-exports this.
arcs_java_library(
    name = "unit_test_build_flags",
    testonly = True,
    constraints = ["android"],
    visibility = ["//java/arcs:arcs-internal"],
    exports = [":build_flags_kt"],
)

# Private kt_library. Don't use this directly, use one of the two variants above.
generate_build_flags(
    name = "build_flags_kt",
    dev_mode = True,
    flags = ARCS_BUILD_FLAGS,
    visibility = ["//visibility:private"],
)
