"""Setup configuration and dependencies for api_whoami."""

from setuptools import find_packages
from setuptools import setup


REQUIREMENTS = [requirement for requirement in open("requirements.txt").readlines()]

COMMANDS = [
    "example_command=api_whoami.tools.example:main",
    "start_api_server=api_whoami.app:main",
]

setup(
    name="api_whoami",
    version="0.0.0.alpha0",
    author="Michael Renn",
    author_email="mrenn2000@gmail.com",
    url="",
    include_package_data=True,
    description="This is a basic Angular FastAPI implementation!",
    packages=find_packages('src'),
    package_dir={
        '': 'src',
    },
    python_requires=">=3.6.6",
    entry_points={"console_scripts": COMMANDS},
    install_requires=REQUIREMENTS,
)
