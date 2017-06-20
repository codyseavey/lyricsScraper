all: build run
	
build:
	docker build -t lyrics .
run:
	docker run -d --name lyric -p 8080:8080 lyrics

clean:
	docker stop lyric
	docker rm lyric

