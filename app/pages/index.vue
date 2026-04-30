<script setup lang="ts">
const route = useRoute()
const dispatchId = route.query.dispatch_id ? String(route.query.dispatch_id) : ''

if (dispatchId) {
  await navigateTo(`/master/dispatches/${dispatchId}`, { replace: true })
}
else {
  await navigateTo('/requester', { replace: true })
}
</script>
