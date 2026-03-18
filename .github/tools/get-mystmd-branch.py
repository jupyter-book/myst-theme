#!/usr/bin/env python
"""
Query the `mystmd-branch` field from the `Attach mystmd build
branch to myst-theme PRs` GitHub project board, and print the git repo
URL and branch to clone.

Project board: https://github.com/orgs/jupyter-book/projects/4

Reads REVIEW_ID (PR number provided by Netlify) and GITHUB_TOKEN from
the environment.

Outputs: `<repo_url> <branch>` on stdout (defaults to `jupyter-book/mystmd main`).

`mystmd-branch` may be:
  - a plain branch name, e.g. `main` or `v0.22`    → jupyter-book/mystmd@<branch>
  - `owner/branch`, e.g. `stefanv/my-feature`      → github.com/stefanv/mystmd@<branch>

"""

import json
import os
import sys
import urllib.error
import urllib.request


DEFAULT_REPO_OWNER = "jupyter-book"
DEFAULT_BRANCH = "main"
PROJECT_NUMBER = 4

QUERY = """
  query($owner: String!, $repo: String!, $pr: Int!) {
    repository(owner: $owner, name: $repo) {
      pullRequest(number: $pr) {
        projectItems(first: 10) {
          nodes {
            project { number }
            fieldValueByName(name: "mystmd-branch") {
              ... on ProjectV2ItemFieldTextValue        { text }
              ... on ProjectV2ItemFieldSingleSelectValue { name }
            }
          }
        }
      }
    }
  }
"""


def query_project_field(pr_number, github_token):
    payload = json.dumps(
        {
            "query": QUERY,
            "variables": {
                "owner": "jupyter-book",
                "repo": "myst-theme",
                "pr": pr_number,
            },
        }
    ).encode()

    req = urllib.request.Request(
        "https://api.github.com/graphql",
        data=payload,
        headers={
            "Authorization": f"Bearer {github_token}",
            "Content-Type": "application/json",
        },
    )

    with urllib.request.urlopen(req) as resp:
        data = json.loads(resp.read())

    if "errors" in data:
        messages = [e.get("message", str(e)) for e in data["errors"]]
        print(f"Warning: GitHub API errors: {'; '.join(messages)}", file=sys.stderr)
        sys.exit(1)

    nodes = (
        data.get("data", {})
        .get("repository", {})
        .get("pullRequest", {})
        .get("projectItems", {})
        .get("nodes", [])
    )
    for node in nodes:
        if node and node.get("project", {}).get("number") == PROJECT_NUMBER:
            fv = node.get("fieldValueByName") or {}
            return fv.get("text") or fv.get("name")

    return None


def main():
    review_id = os.environ.get("REVIEW_ID")
    github_token = os.environ.get("GITHUB_TOKEN")

    repo_owner = DEFAULT_REPO_OWNER
    branch = DEFAULT_BRANCH

    if review_id is None:
        print("No REVIEW_ID set by Netlify; exiting.")
        sys.exit(1)

    if github_token is None:
        print("No GITHUB_TOKEN set; exiting.")
        sys.exit(1)

    try:
        value = query_project_field(int(review_id), github_token)
        if value:
            if "/" in value:
                repo_owner, branch = value.split("/", 1)
            else:
                branch = value
    except Exception as e:
        print(f"Warning: failed to query mystmd-branch: {e}", file=sys.stderr)
        sys.exit(1)

    print(f"https://github.com/{repo_owner}/mystmd.git {branch}")


if __name__ == "__main__":
    main()
