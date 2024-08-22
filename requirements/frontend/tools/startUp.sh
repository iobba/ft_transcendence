>&1 echo "Check upstreams"

until nc -z "users" 8000; do
  >&2 echo "users is unavailable - sleeping"
  sleep 1
done
>&1 echo "users is available - active"

until nc -z "matches" 8000; do
  >&2 echo "matches is unavailable - sleeping"
  sleep 1
done
>&1 echo "matches is available - active"

until nc -z "useractivity" 5000; do
  >&2 echo "useractivity is unavailable - sleeping"
  sleep 1
done
>&1 echo "useractivity is available - active"

until nc -z "gameBack" 9000; do
  >&2 echo "gameBack is unavailable - sleeping"
  sleep 1
done
>&1 echo "gameBack is available - active"

exec npm start
