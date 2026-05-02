package com.ayucare.voiceassistant.ui.screen

import androidx.compose.foundation.Canvas
import androidx.compose.foundation.background
import androidx.compose.foundation.border
import androidx.compose.foundation.clickable
import androidx.compose.foundation.horizontalScroll
import androidx.compose.foundation.layout.Arrangement
import androidx.compose.foundation.layout.Box
import androidx.compose.foundation.layout.Column
import androidx.compose.foundation.layout.Row
import androidx.compose.foundation.layout.Spacer
import androidx.compose.foundation.layout.fillMaxSize
import androidx.compose.foundation.layout.fillMaxWidth
import androidx.compose.foundation.layout.height
import androidx.compose.foundation.layout.padding
import androidx.compose.foundation.layout.size
import androidx.compose.foundation.layout.width
import androidx.compose.foundation.rememberScrollState
import androidx.compose.foundation.shape.CircleShape
import androidx.compose.foundation.shape.RoundedCornerShape
import androidx.compose.foundation.text.BasicTextField
import androidx.compose.foundation.verticalScroll
import androidx.compose.material.icons.Icons
import androidx.compose.material.icons.automirrored.outlined.ArrowBack
import androidx.compose.material.icons.automirrored.outlined.KeyboardArrowRight
import androidx.compose.material.icons.outlined.Add
import androidx.compose.material.icons.outlined.GraphicEq
import androidx.compose.material.icons.outlined.Home
import androidx.compose.material.icons.outlined.LocalHospital
import androidx.compose.material.icons.outlined.Person
import androidx.compose.material.icons.outlined.Restaurant
import androidx.compose.material.icons.outlined.Search
import androidx.compose.material.icons.outlined.Star
import androidx.compose.material3.Card
import androidx.compose.material3.CardDefaults
import androidx.compose.material3.Icon
import androidx.compose.material3.MaterialTheme
import androidx.compose.material3.Text
import androidx.compose.runtime.Composable
import androidx.compose.runtime.getValue
import androidx.compose.runtime.mutableIntStateOf
import androidx.compose.runtime.mutableStateOf
import androidx.compose.runtime.remember
import androidx.compose.runtime.setValue
import androidx.compose.ui.Alignment
import androidx.compose.ui.Modifier
import androidx.compose.ui.draw.clip
import androidx.compose.ui.draw.shadow
import androidx.compose.ui.geometry.Offset
import androidx.compose.ui.geometry.Size
import androidx.compose.ui.graphics.Brush
import androidx.compose.ui.graphics.Color
import androidx.compose.ui.graphics.vector.ImageVector
import androidx.compose.ui.text.TextStyle
import androidx.compose.ui.text.font.FontWeight
import androidx.compose.ui.text.style.TextOverflow
import androidx.compose.ui.unit.dp
import androidx.compose.ui.unit.sp
import com.ayucare.voiceassistant.data.AppUiState
import com.ayucare.voiceassistant.data.FoodItem
import com.ayucare.voiceassistant.data.Product
import com.ayucare.voiceassistant.data.Professional
import com.ayucare.voiceassistant.ui.theme.WellnessBlue
import com.ayucare.voiceassistant.ui.theme.WellnessLavender
import com.ayucare.voiceassistant.ui.theme.WellnessMustard
import com.ayucare.voiceassistant.ui.theme.WellnessPink
import com.ayucare.voiceassistant.ui.theme.WellnessSage

private data class CareLane(
    val label: String,
    val searchHint: String,
    val icon: ImageVector,
    val accent: Color,
)

private data class CareMode(
    val title: String,
    val subtitle: String,
    val stat: String,
    val filters: List<String>,
    val accent: Color,
    val icon: ImageVector,
    val items: List<CareCatalogItem>,
    val bookingMode: Boolean,
)

private data class CareCatalogItem(
    val name: String,
    val category: String,
    val provider: String,
    val detail: String,
    val price: String,
    val rating: String,
    val eta: String,
    val tag: String = "",
    val icon: ImageVector,
    val accent: Color,
    val id: String = "",
    val kind: String = "",
)

private data class AppointmentDate(
    val day: String,
    val date: String,
)

@Composable
fun CarePage(
    appState: AppUiState,
    onCreateActivity: (kind: String, sourceItemId: String, note: String?) -> Unit,
    modifier: Modifier = Modifier,
) {
    val lanes = remember {
        listOf(
            CareLane("Pharmacy", "Search medicines, supplements...", Icons.Outlined.LocalHospital, WellnessSage),
            CareLane("Food", "Search meals, kitchens...", Icons.Outlined.Restaurant, Color(0xFFFFB3A6)),
            CareLane("Lab Tests", "Search tests, labs...", Icons.Outlined.GraphicEq, WellnessBlue),
            CareLane("Doctor", "Search doctors, specialties...", Icons.Outlined.Person, WellnessPink),
            CareLane("Groceries", "Search groceries, pantry...", Icons.Outlined.Home, WellnessMustard),
        )
    }
    var selectedLane by remember { mutableIntStateOf(0) }
    var query by remember { mutableStateOf("") }
    var selectedItem by remember { mutableStateOf<CareCatalogItem?>(null) }
    var notice by remember { mutableStateOf("") }
    val lane = lanes[selectedLane]
    val mode = remember(selectedLane, appState.careProducts, appState.careProfessionals, appState.careFood) {
        careModeFor(lane.label, lane.accent, lane.icon, appState)
    }
    var selectedFilter by remember(selectedLane) { mutableIntStateOf(0) }
    val activeFilter = mode.filters[selectedFilter]
    val visibleItems = remember(mode, activeFilter, query) {
        mode.items.filter { item ->
            val matchesFilter = activeFilter == "All" || item.category == activeFilter
            val searchable = "${item.name} ${item.provider} ${item.category} ${item.detail}".lowercase()
            matchesFilter && query.trim().lowercase().split(" ").filter { it.isNotBlank() }.all { it in searchable }
        }
    }
    fun submitActivity(item: CareCatalogItem, fallbackKind: String, action: String) {
        if (item.id.isBlank()) {
            notice = "This item is not connected to a backend id yet."
            return
        }
        onCreateActivity(item.kind.ifBlank { fallbackKind }, item.id, "$action from Android")
        notice = "${item.name} $action."
        selectedItem = null
    }

    Box(
        modifier = modifier
            .fillMaxSize()
            .background(
                Brush.verticalGradient(
                    colors = listOf(
                        Color(0xFFFFE57D),
                        Color(0xFFFFF5D2),
                        Color(0xFFFFFCF4),
                    ),
                ),
            ),
    ) {
        CareBackground()

        selectedItem?.let { item ->
            val detailModifier = Modifier
                .fillMaxSize()
                .padding(horizontal = 18.dp)
                .padding(top = 18.dp, bottom = 24.dp)
            when (lane.label) {
                "Doctor" -> DoctorAppointmentPage(
                    doctor = item,
                    onBack = { selectedItem = null },
                    onConfirm = { submitActivity(item, "doctor", "booked") },
                    modifier = detailModifier,
                )
                "Lab Tests" -> LabTestBookingPage(
                    test = item,
                    onBack = { selectedItem = null },
                    onConfirm = { submitActivity(item, "lab", "booked") },
                    modifier = detailModifier,
                )
                "Food" -> FoodOrderPage(
                    meal = item,
                    onBack = { selectedItem = null },
                    onConfirm = { submitActivity(item, "food", "ordered") },
                    modifier = detailModifier,
                )
                else -> ProductDetailPage(
                    item = item,
                    section = lane.label,
                    onBack = { selectedItem = null },
                    onConfirm = { submitActivity(item, "product", "ordered") },
                    modifier = detailModifier,
                )
            }
        } ?: Column(
            modifier = Modifier
                .fillMaxSize()
                .verticalScroll(rememberScrollState())
                .padding(horizontal = 18.dp)
                .padding(top = 18.dp, bottom = 24.dp),
            verticalArrangement = Arrangement.spacedBy(16.dp),
        ) {
            CareTopBar(itemCount = visibleItems.size, bookingMode = mode.bookingMode)
            if (notice.isNotBlank()) {
                Text(
                    text = notice,
                    modifier = Modifier
                        .fillMaxWidth()
                        .clip(RoundedCornerShape(16.dp))
                        .background(Color.White.copy(alpha = 0.72f))
                        .padding(horizontal = 12.dp, vertical = 9.dp),
                    style = MaterialTheme.typography.labelSmall.copy(
                        fontSize = 12.sp,
                        fontWeight = FontWeight.Bold,
                    ),
                    color = CareInk,
                )
            }
            CareSearchField(
                value = query,
                hint = lane.searchHint,
                onValueChange = { query = it },
            )
            CareLaneRow(
                lanes = lanes,
                selectedLane = selectedLane,
                onSelected = {
                    selectedLane = it
                    query = ""
                    selectedItem = null
                },
            )
            CareModeHero(mode = mode)
            CareFilterRow(
                filters = mode.filters,
                selectedFilter = selectedFilter,
                accent = mode.accent,
                onSelected = { selectedFilter = it },
            )
            CareSectionHeader(
                title = if (mode.bookingMode) "Available to book" else "Available now",
                action = "${visibleItems.size} options",
            )
            if (mode.bookingMode) {
                CareBookingList(
                    items = visibleItems,
                    onBook = { item -> selectedItem = item },
                )
            } else {
                CareProductGrid(
                    items = visibleItems,
                    onItemSelected = { item -> selectedItem = item },
                )
            }
        }
    }
}

@Composable
private fun CareBackground() {
    Canvas(modifier = Modifier.fillMaxSize()) {
        drawCircle(
            color = Color(0xFFFFD44E).copy(alpha = 0.34f),
            radius = size.width * 0.58f,
            center = Offset(size.width * 0.05f, size.height * 0.02f),
        )
        drawCircle(
            color = Color(0xFFBDE8D2).copy(alpha = 0.23f),
            radius = size.width * 0.46f,
            center = Offset(size.width * 0.98f, size.height * 0.42f),
        )
        drawCircle(
            color = Color.White.copy(alpha = 0.7f),
            radius = size.width * 0.72f,
            center = Offset(size.width * 0.54f, size.height * 1.02f),
        )
    }
}

@Composable
private fun CareTopBar(itemCount: Int, bookingMode: Boolean) {
    Row(
        modifier = Modifier.fillMaxWidth(),
        verticalAlignment = Alignment.CenterVertically,
    ) {
        Spacer(Modifier.weight(1f))
        Text(
            text = "Care",
            style = MaterialTheme.typography.titleMedium.copy(
                fontSize = 18.sp,
                fontWeight = FontWeight.Bold,
            ),
            color = CareInk,
        )
        Row(
            modifier = Modifier.weight(1f),
            horizontalArrangement = Arrangement.End,
        ) {
            Box(
                modifier = Modifier
                    .clip(RoundedCornerShape(15.dp))
                    .background(Color.White.copy(alpha = 0.72f))
                    .padding(horizontal = 11.dp, vertical = 8.dp),
                contentAlignment = Alignment.Center,
            ) {
                Text(
                    text = if (bookingMode) "$itemCount slots" else "$itemCount items",
                    style = MaterialTheme.typography.labelSmall.copy(
                        fontSize = 11.sp,
                        fontWeight = FontWeight.Bold,
                    ),
                    color = CareInk,
                    maxLines = 1,
                )
            }
        }
    }
}

@Composable
private fun CareSearchField(
    value: String,
    hint: String,
    onValueChange: (String) -> Unit,
) {
    Row(
        modifier = Modifier
            .fillMaxWidth()
            .height(50.dp)
            .shadow(10.dp, RoundedCornerShape(18.dp), spotColor = Color(0x18000000))
            .clip(RoundedCornerShape(18.dp))
            .background(Color.White.copy(alpha = 0.88f))
            .border(1.dp, Color.White.copy(alpha = 0.95f), RoundedCornerShape(18.dp))
            .padding(horizontal = 14.dp),
        verticalAlignment = Alignment.CenterVertically,
    ) {
        Icon(
            imageVector = Icons.Outlined.Search,
            contentDescription = null,
            modifier = Modifier.size(20.dp),
            tint = CareMuted,
        )
        Spacer(Modifier.width(9.dp))
        Box(modifier = Modifier.weight(1f)) {
            if (value.isBlank()) {
                Text(
                    text = hint,
                    style = MaterialTheme.typography.labelSmall.copy(fontSize = 13.sp),
                    color = Color(0xFF9B927D),
                    maxLines = 1,
                    overflow = TextOverflow.Ellipsis,
                )
            }
            BasicTextField(
                value = value,
                onValueChange = onValueChange,
                singleLine = true,
                textStyle = TextStyle(
                    color = CareInk,
                    fontSize = 14.sp,
                    fontWeight = FontWeight.Medium,
                ),
                modifier = Modifier.fillMaxWidth(),
            )
        }
    }
}

@Composable
private fun CareLaneRow(
    lanes: List<CareLane>,
    selectedLane: Int,
    onSelected: (Int) -> Unit,
) {
    Row(
        modifier = Modifier
            .fillMaxWidth()
            .horizontalScroll(rememberScrollState()),
        horizontalArrangement = Arrangement.spacedBy(10.dp),
    ) {
        lanes.forEachIndexed { index, lane ->
            val selected = selectedLane == index
            Column(
                modifier = Modifier
                    .width(76.dp)
                    .clip(RoundedCornerShape(18.dp))
                    .clickable { onSelected(index) }
                    .padding(vertical = 2.dp),
                horizontalAlignment = Alignment.CenterHorizontally,
                verticalArrangement = Arrangement.spacedBy(7.dp),
            ) {
                Box(
                    modifier = Modifier
                        .size(49.dp)
                        .shadow(
                            elevation = if (selected) 12.dp else 4.dp,
                            shape = CircleShape,
                            spotColor = lane.accent.copy(alpha = 0.36f),
                        )
                        .clip(CircleShape)
                        .background(if (selected) lane.accent else Color.White.copy(alpha = 0.82f))
                        .border(1.dp, Color.White.copy(alpha = 0.9f), CircleShape),
                    contentAlignment = Alignment.Center,
                ) {
                    Icon(
                        imageVector = lane.icon,
                        contentDescription = lane.label,
                        modifier = Modifier.size(22.dp),
                        tint = CareInk,
                    )
                }
                Text(
                    text = lane.label,
                    style = MaterialTheme.typography.labelSmall.copy(
                        fontSize = 10.sp,
                        fontWeight = FontWeight.Bold,
                    ),
                    color = CareInk,
                    maxLines = 1,
                    overflow = TextOverflow.Ellipsis,
                )
            }
        }
    }
}

@Composable
private fun CareModeHero(mode: CareMode) {
    Card(
        modifier = Modifier
            .fillMaxWidth()
            .height(134.dp)
            .shadow(14.dp, RoundedCornerShape(24.dp), spotColor = Color(0x22000000)),
        shape = RoundedCornerShape(24.dp),
        colors = CardDefaults.cardColors(containerColor = Color.Transparent),
    ) {
        Box(
            modifier = Modifier
                .fillMaxSize()
                .background(
                    Brush.horizontalGradient(
                        colors = listOf(
                            mode.accent.copy(alpha = 0.72f),
                            Color.White.copy(alpha = 0.82f),
                            Color(0xFFFFF7D4),
                        ),
                    ),
                )
                .padding(16.dp),
        ) {
            Column(
                modifier = Modifier
                    .align(Alignment.CenterStart)
                    .fillMaxWidth(0.66f),
                verticalArrangement = Arrangement.spacedBy(6.dp),
            ) {
                Text(
                    text = mode.stat,
                    style = MaterialTheme.typography.labelSmall.copy(
                        fontSize = 12.sp,
                        fontWeight = FontWeight.Bold,
                    ),
                    color = Color(0xFF4F7440),
                    maxLines = 1,
                )
                Text(
                    text = mode.title,
                    style = MaterialTheme.typography.titleMedium.copy(
                        fontSize = 19.sp,
                        lineHeight = 22.sp,
                        fontWeight = FontWeight.Bold,
                    ),
                    color = CareInk,
                    maxLines = 2,
                    overflow = TextOverflow.Ellipsis,
                )
                Text(
                    text = mode.subtitle,
                    style = MaterialTheme.typography.labelSmall.copy(fontSize = 12.sp),
                    color = CareMuted,
                    maxLines = 2,
                    overflow = TextOverflow.Ellipsis,
                )
            }
            CareHeroIllustration(
                icon = mode.icon,
                accent = mode.accent,
                modifier = Modifier
                    .align(Alignment.CenterEnd)
                    .size(86.dp),
            )
        }
    }
}

@Composable
private fun CareHeroIllustration(
    icon: ImageVector,
    accent: Color,
    modifier: Modifier = Modifier,
) {
    Box(modifier = modifier, contentAlignment = Alignment.Center) {
        Canvas(modifier = Modifier.fillMaxSize()) {
            drawOval(
                color = Color(0x1F000000),
                topLeft = Offset(size.width * 0.12f, size.height * 0.74f),
                size = Size(size.width * 0.76f, size.height * 0.16f),
            )
            drawCircle(
                color = Color.White.copy(alpha = 0.8f),
                radius = size.minDimension * 0.42f,
                center = Offset(size.width * 0.5f, size.height * 0.46f),
            )
            drawCircle(
                color = accent.copy(alpha = 0.52f),
                radius = size.minDimension * 0.31f,
                center = Offset(size.width * 0.5f, size.height * 0.46f),
            )
        }
        Icon(
            imageVector = icon,
            contentDescription = null,
            modifier = Modifier.size(37.dp),
            tint = CareInk,
        )
    }
}

@Composable
private fun CareFilterRow(
    filters: List<String>,
    selectedFilter: Int,
    accent: Color,
    onSelected: (Int) -> Unit,
) {
    Row(
        modifier = Modifier
            .fillMaxWidth()
            .horizontalScroll(rememberScrollState()),
        horizontalArrangement = Arrangement.spacedBy(8.dp),
    ) {
        filters.forEachIndexed { index, filter ->
            val selected = selectedFilter == index
            Box(
                modifier = Modifier
                    .clip(RoundedCornerShape(16.dp))
                    .background(if (selected) accent.copy(alpha = 0.72f) else Color.White.copy(alpha = 0.62f))
                    .border(1.dp, Color.White.copy(alpha = 0.82f), RoundedCornerShape(16.dp))
                    .clickable { onSelected(index) }
                    .padding(horizontal = 13.dp, vertical = 9.dp),
                contentAlignment = Alignment.Center,
            ) {
                Text(
                    text = filter,
                    style = MaterialTheme.typography.labelSmall.copy(
                        fontSize = 12.sp,
                        fontWeight = FontWeight.Bold,
                    ),
                    color = CareInk,
                    maxLines = 1,
                )
            }
        }
    }
}

@Composable
private fun CareProductGrid(
    items: List<CareCatalogItem>,
    onItemSelected: (CareCatalogItem) -> Unit,
) {
    Column(verticalArrangement = Arrangement.spacedBy(10.dp)) {
        items.chunked(2).forEach { rowItems ->
            Row(
                modifier = Modifier.fillMaxWidth(),
                horizontalArrangement = Arrangement.spacedBy(10.dp),
            ) {
                rowItems.forEach { item ->
                    CareProductCard(
                        item = item,
                        onSelect = { onItemSelected(item) },
                        modifier = Modifier.weight(1f),
                    )
                }
                if (rowItems.size == 1) {
                    Spacer(modifier = Modifier.weight(1f))
                }
            }
        }
    }
}

@Composable
private fun CareProductCard(
    item: CareCatalogItem,
    onSelect: () -> Unit,
    modifier: Modifier = Modifier,
) {
    Card(
        modifier = modifier
            .height(214.dp)
            .clickable { onSelect() }
            .shadow(10.dp, RoundedCornerShape(20.dp), spotColor = Color(0x16000000)),
        shape = RoundedCornerShape(20.dp),
        colors = CardDefaults.cardColors(containerColor = Color.White.copy(alpha = 0.86f)),
    ) {
        Column(
            modifier = Modifier
                .fillMaxSize()
                .border(1.dp, Color.White.copy(alpha = 0.92f), RoundedCornerShape(20.dp))
                .padding(12.dp),
            verticalArrangement = Arrangement.SpaceBetween,
        ) {
            Box(
                modifier = Modifier
                    .fillMaxWidth()
                    .height(78.dp)
                    .clip(RoundedCornerShape(16.dp))
                    .background(item.accent.copy(alpha = 0.36f)),
                contentAlignment = Alignment.Center,
            ) {
                Icon(
                    imageVector = item.icon,
                    contentDescription = null,
                    modifier = Modifier.size(36.dp),
                    tint = CareInk,
                )
                if (item.tag.isNotBlank()) {
                    Text(
                        text = item.tag,
                        modifier = Modifier
                            .align(Alignment.TopStart)
                            .padding(7.dp)
                            .clip(RoundedCornerShape(9.dp))
                            .background(Color.White.copy(alpha = 0.72f))
                            .padding(horizontal = 7.dp, vertical = 3.dp),
                        style = MaterialTheme.typography.labelSmall.copy(
                            fontSize = 9.sp,
                            fontWeight = FontWeight.Bold,
                        ),
                        color = CareInk,
                        maxLines = 1,
                    )
                }
            }
            Column(verticalArrangement = Arrangement.spacedBy(3.dp)) {
                Row(verticalAlignment = Alignment.CenterVertically) {
                    Icon(
                        imageVector = Icons.Outlined.Star,
                        contentDescription = null,
                        modifier = Modifier.size(12.dp),
                        tint = Color(0xFFD4A018),
                    )
                    Spacer(Modifier.width(3.dp))
                    Text(
                        text = item.rating,
                        style = MaterialTheme.typography.labelSmall.copy(
                            fontSize = 10.sp,
                            fontWeight = FontWeight.Bold,
                        ),
                        color = CareMuted,
                    )
                }
                Text(
                    text = item.name,
                    style = MaterialTheme.typography.labelSmall.copy(
                        fontSize = 13.sp,
                        lineHeight = 15.sp,
                        fontWeight = FontWeight.Bold,
                    ),
                    color = CareInk,
                    maxLines = 2,
                    overflow = TextOverflow.Ellipsis,
                )
                Text(
                    text = item.detail,
                    style = MaterialTheme.typography.labelSmall.copy(fontSize = 10.sp),
                    color = CareMuted,
                    maxLines = 1,
                    overflow = TextOverflow.Ellipsis,
                )
                Text(
                    text = item.eta,
                    style = MaterialTheme.typography.labelSmall.copy(
                        fontSize = 10.sp,
                        fontWeight = FontWeight.Bold,
                    ),
                    color = Color(0xFF4A8E57),
                    maxLines = 1,
                )
            }
            Row(
                modifier = Modifier.fillMaxWidth(),
                verticalAlignment = Alignment.CenterVertically,
            ) {
                Text(
                    text = item.price,
                    style = MaterialTheme.typography.labelSmall.copy(
                        fontSize = 14.sp,
                        fontWeight = FontWeight.Bold,
                    ),
                    color = CareInk,
                )
                Spacer(Modifier.weight(1f))
                Box(
                    modifier = Modifier
                        .size(30.dp)
                        .clip(CircleShape)
                        .background(WellnessMustard)
                        .clickable { onSelect() },
                    contentAlignment = Alignment.Center,
                ) {
                    Icon(
                        imageVector = Icons.Outlined.Add,
                        contentDescription = "Add ${item.name}",
                        modifier = Modifier.size(18.dp),
                        tint = CareInk,
                    )
                }
            }
        }
    }
}

@Composable
private fun CareBookingList(
    items: List<CareCatalogItem>,
    onBook: ((CareCatalogItem) -> Unit)? = null,
) {
    Column(verticalArrangement = Arrangement.spacedBy(10.dp)) {
        items.forEach { item ->
            CareBookingCard(item = item, onBook = onBook)
        }
    }
}

@Composable
private fun CareBookingCard(
    item: CareCatalogItem,
    onBook: ((CareCatalogItem) -> Unit)? = null,
) {
    Row(
        modifier = Modifier
            .fillMaxWidth()
            .clip(RoundedCornerShape(20.dp))
            .background(Color.White.copy(alpha = 0.84f))
            .border(1.dp, Color.White.copy(alpha = 0.92f), RoundedCornerShape(20.dp))
            .padding(12.dp),
        verticalAlignment = Alignment.CenterVertically,
    ) {
        Box(
            modifier = Modifier
                .size(54.dp)
                .clip(RoundedCornerShape(17.dp))
                .background(item.accent.copy(alpha = 0.42f)),
            contentAlignment = Alignment.Center,
        ) {
            Icon(
                imageVector = item.icon,
                contentDescription = null,
                modifier = Modifier.size(25.dp),
                tint = CareInk,
            )
        }
        Spacer(Modifier.width(12.dp))
        Column(modifier = Modifier.weight(1f), verticalArrangement = Arrangement.spacedBy(3.dp)) {
            Row(verticalAlignment = Alignment.CenterVertically) {
                Text(
                    text = item.name,
                    modifier = Modifier.weight(1f),
                    style = MaterialTheme.typography.labelSmall.copy(
                        fontSize = 14.sp,
                        fontWeight = FontWeight.Bold,
                    ),
                    color = CareInk,
                    maxLines = 1,
                    overflow = TextOverflow.Ellipsis,
                )
                Icon(
                    imageVector = Icons.Outlined.Star,
                    contentDescription = null,
                    modifier = Modifier.size(12.dp),
                    tint = Color(0xFFD4A018),
                )
                Spacer(Modifier.width(3.dp))
                Text(
                    text = item.rating,
                    style = MaterialTheme.typography.labelSmall.copy(
                        fontSize = 10.sp,
                        fontWeight = FontWeight.Bold,
                    ),
                    color = CareMuted,
                )
            }
            Text(
                text = item.detail,
                style = MaterialTheme.typography.labelSmall.copy(fontSize = 12.sp),
                color = CareMuted,
                maxLines = 1,
                overflow = TextOverflow.Ellipsis,
            )
            Text(
                text = "${item.provider} - ${item.eta}",
                style = MaterialTheme.typography.labelSmall.copy(
                    fontSize = 11.sp,
                    fontWeight = FontWeight.Bold,
                ),
                color = Color(0xFF4A8E57),
                maxLines = 1,
                overflow = TextOverflow.Ellipsis,
            )
        }
        Spacer(Modifier.width(8.dp))
        Column(horizontalAlignment = Alignment.End, verticalArrangement = Arrangement.spacedBy(8.dp)) {
            Text(
                text = item.price,
                style = MaterialTheme.typography.labelSmall.copy(
                    fontSize = 13.sp,
                    fontWeight = FontWeight.Bold,
                ),
                color = CareInk,
            )
            Box(
                modifier = Modifier
                    .clip(RoundedCornerShape(14.dp))
                    .background(item.accent.copy(alpha = 0.56f))
                    .then(if (onBook != null) Modifier.clickable { onBook(item) } else Modifier)
                    .padding(horizontal = 11.dp, vertical = 7.dp),
            ) {
                Text(
                    text = "Book",
                    style = MaterialTheme.typography.labelSmall.copy(
                        fontSize = 11.sp,
                        fontWeight = FontWeight.Bold,
                    ),
                    color = CareInk,
                )
            }
        }
    }
}

@Composable
private fun ProductDetailPage(
    item: CareCatalogItem,
    section: String,
    onBack: () -> Unit,
    onConfirm: () -> Unit,
    modifier: Modifier = Modifier,
) {
    val deliveryOptions = remember(section) {
        if (section == "Groceries") {
            listOf(
                Triple("Express delivery", item.eta, Icons.Outlined.Home),
                Triple("Add to weekly basket", "Deliver with next pantry order", Icons.Outlined.Add),
            )
        } else {
            listOf(
                Triple("Home delivery", item.eta, Icons.Outlined.Home),
                Triple("Store pickup", "Ready in 20 min", Icons.Outlined.LocalHospital),
            )
        }
    }
    var quantity by remember { mutableIntStateOf(1) }
    var selectedDelivery by remember { mutableIntStateOf(0) }

    Column(
        modifier = modifier.verticalScroll(rememberScrollState()),
        verticalArrangement = Arrangement.spacedBy(18.dp),
    ) {
        DoctorAppointmentTopBar(title = "$section Detail", onBack = onBack)
        DetailHeroCard(item = item)
        DetailInfoPanel(
            title = "About this item",
            lines = listOf(
                item.detail,
                "Sold by ${item.provider}",
                "${item.rating} rating - ${item.category}",
            ),
        )
        Text(
            text = "Quantity",
            style = MaterialTheme.typography.labelSmall.copy(fontSize = 14.sp, fontWeight = FontWeight.Bold),
            color = CareInk,
        )
        QuantityStepper(quantity = quantity, onMinus = { quantity = (quantity - 1).coerceAtLeast(1) }, onPlus = { quantity += 1 })
        Text(
            text = "Fulfilment",
            style = MaterialTheme.typography.labelSmall.copy(fontSize = 14.sp, fontWeight = FontWeight.Bold),
            color = CareInk,
        )
        Column(verticalArrangement = Arrangement.spacedBy(10.dp)) {
            deliveryOptions.forEachIndexed { index, option ->
                ConsultationTypeTile(
                    title = option.first,
                    subtitle = option.second,
                    icon = option.third,
                    selected = selectedDelivery == index,
                    onClick = { selectedDelivery = index },
                )
            }
        }
        PrimaryCareButton(text = "Add to Cart - ${item.price}", onClick = onConfirm)
    }
}

@Composable
private fun FoodOrderPage(
    meal: CareCatalogItem,
    onBack: () -> Unit,
    onConfirm: () -> Unit,
    modifier: Modifier = Modifier,
) {
    val portions = remember { listOf("Regular", "High Protein", "Light") }
    val deliveryTypes = remember {
        listOf(
            Triple("Deliver now", meal.eta, Icons.Outlined.Restaurant),
            Triple("Schedule dinner", "Today 7:30 PM", Icons.Outlined.Home),
        )
    }
    var selectedPortion by remember { mutableIntStateOf(0) }
    var selectedDelivery by remember { mutableIntStateOf(0) }

    Column(
        modifier = modifier.verticalScroll(rememberScrollState()),
        verticalArrangement = Arrangement.spacedBy(18.dp),
    ) {
        DoctorAppointmentTopBar(title = "Order Meal", onBack = onBack)
        DetailHeroCard(item = meal)
        DetailInfoPanel(
            title = meal.provider,
            lines = listOf(
                meal.detail,
                "${meal.rating} rating - ${meal.category}",
                "Clara tags this as a balanced care meal.",
            ),
        )
        Text(
            text = "Portion",
            style = MaterialTheme.typography.labelSmall.copy(fontSize = 14.sp, fontWeight = FontWeight.Bold),
            color = CareInk,
        )
        Row(horizontalArrangement = Arrangement.spacedBy(9.dp), modifier = Modifier.fillMaxWidth()) {
            portions.forEachIndexed { index, label ->
                AppointmentTimeTile(
                    time = label,
                    selected = selectedPortion == index,
                    onClick = { selectedPortion = index },
                    modifier = Modifier.weight(1f),
                )
            }
        }
        Text(
            text = "Delivery",
            style = MaterialTheme.typography.labelSmall.copy(fontSize = 14.sp, fontWeight = FontWeight.Bold),
            color = CareInk,
        )
        Column(verticalArrangement = Arrangement.spacedBy(10.dp)) {
            deliveryTypes.forEachIndexed { index, option ->
                ConsultationTypeTile(
                    title = option.first,
                    subtitle = option.second,
                    icon = option.third,
                    selected = selectedDelivery == index,
                    onClick = { selectedDelivery = index },
                )
            }
        }
        PrimaryCareButton(text = "Add Meal - ${meal.price}", onClick = onConfirm)
    }
}

@Composable
private fun LabTestBookingPage(
    test: CareCatalogItem,
    onBack: () -> Unit,
    onConfirm: () -> Unit,
    modifier: Modifier = Modifier,
) {
    val dates = remember {
        listOf(
            AppointmentDate("Mon", "20"),
            AppointmentDate("Tue", "21"),
            AppointmentDate("Wed", "22"),
            AppointmentDate("Thu", "23"),
            AppointmentDate("Fri", "24"),
        )
    }
    val times = remember { listOf("07:00 AM", "08:30 AM", "10:00 AM", "05:00 PM") }
    val collectionTypes = remember {
        listOf(
            Triple("Home collection", "Phlebotomist visits your home", Icons.Outlined.Home),
            Triple("Walk in", "Visit nearest lab center", Icons.Outlined.LocalHospital),
        )
    }
    var selectedDate by remember { mutableIntStateOf(0) }
    var selectedTime by remember { mutableIntStateOf(1) }
    var selectedCollection by remember { mutableIntStateOf(0) }

    Column(
        modifier = modifier.verticalScroll(rememberScrollState()),
        verticalArrangement = Arrangement.spacedBy(18.dp),
    ) {
        DoctorAppointmentTopBar(title = "Book Lab Test", onBack = onBack)
        DetailHeroCard(item = test)
        DetailInfoPanel(
            title = "Test preparation",
            lines = listOf(
                test.detail,
                "Provider: ${test.provider}",
                if (test.category == "Profiles" || test.category == "Metabolic") "Fasting may be required." else "No special preparation needed.",
            ),
        )
        Row(verticalAlignment = Alignment.CenterVertically) {
            Text(
                text = "Select Date",
                modifier = Modifier.weight(1f),
                style = MaterialTheme.typography.labelSmall.copy(fontSize = 14.sp, fontWeight = FontWeight.Bold),
                color = CareInk,
            )
            Text(
                text = "May 2026",
                style = MaterialTheme.typography.labelSmall.copy(fontSize = 13.sp, fontWeight = FontWeight.Bold),
                color = CareMuted,
            )
        }
        Row(modifier = Modifier.fillMaxWidth(), horizontalArrangement = Arrangement.SpaceBetween) {
            dates.forEachIndexed { index, date ->
                AppointmentDateTile(date = date, selected = selectedDate == index, onClick = { selectedDate = index })
            }
        }
        Text(
            text = "Collection Time",
            style = MaterialTheme.typography.labelSmall.copy(fontSize = 14.sp, fontWeight = FontWeight.Bold),
            color = CareInk,
        )
        Row(horizontalArrangement = Arrangement.spacedBy(9.dp), modifier = Modifier.fillMaxWidth()) {
            times.forEachIndexed { index, time ->
                AppointmentTimeTile(
                    time = time,
                    selected = selectedTime == index,
                    onClick = { selectedTime = index },
                    modifier = Modifier.weight(1f),
                )
            }
        }
        Text(
            text = "Collection Type",
            style = MaterialTheme.typography.labelSmall.copy(fontSize = 14.sp, fontWeight = FontWeight.Bold),
            color = CareInk,
        )
        Column(verticalArrangement = Arrangement.spacedBy(10.dp)) {
            collectionTypes.forEachIndexed { index, type ->
                ConsultationTypeTile(
                    title = type.first,
                    subtitle = type.second,
                    icon = type.third,
                    selected = selectedCollection == index,
                    onClick = { selectedCollection = index },
                )
            }
        }
        PrimaryCareButton(text = "Confirm Test Booking", onClick = onConfirm)
    }
}

@Composable
private fun DetailHeroCard(item: CareCatalogItem) {
    Card(
        modifier = Modifier
            .fillMaxWidth()
            .shadow(12.dp, RoundedCornerShape(24.dp), spotColor = Color(0x18000000)),
        shape = RoundedCornerShape(24.dp),
        colors = CardDefaults.cardColors(containerColor = Color.White.copy(alpha = 0.84f)),
    ) {
        Row(
            modifier = Modifier
                .fillMaxWidth()
                .border(1.dp, Color.White.copy(alpha = 0.92f), RoundedCornerShape(24.dp))
                .padding(14.dp),
            verticalAlignment = Alignment.CenterVertically,
        ) {
            Box(
                modifier = Modifier
                    .size(94.dp)
                    .clip(RoundedCornerShape(22.dp))
                    .background(item.accent.copy(alpha = 0.42f)),
                contentAlignment = Alignment.Center,
            ) {
                Icon(
                    imageVector = item.icon,
                    contentDescription = null,
                    modifier = Modifier.size(44.dp),
                    tint = CareInk,
                )
            }
            Spacer(Modifier.width(14.dp))
            Column(modifier = Modifier.weight(1f), verticalArrangement = Arrangement.spacedBy(6.dp)) {
                Text(
                    text = item.name,
                    style = MaterialTheme.typography.titleMedium.copy(
                        fontSize = 19.sp,
                        lineHeight = 22.sp,
                        fontWeight = FontWeight.Bold,
                    ),
                    color = CareInk,
                    maxLines = 2,
                    overflow = TextOverflow.Ellipsis,
                )
                Text(
                    text = item.detail,
                    style = MaterialTheme.typography.labelSmall.copy(fontSize = 12.sp),
                    color = CareMuted,
                    maxLines = 2,
                    overflow = TextOverflow.Ellipsis,
                )
                Row(verticalAlignment = Alignment.CenterVertically) {
                    Icon(
                        imageVector = Icons.Outlined.Star,
                        contentDescription = null,
                        modifier = Modifier.size(14.dp),
                        tint = Color(0xFFD4A018),
                    )
                    Spacer(Modifier.width(4.dp))
                    Text(
                        text = "${item.rating} - ${item.price}",
                        style = MaterialTheme.typography.labelSmall.copy(
                            fontSize = 13.sp,
                            fontWeight = FontWeight.Bold,
                        ),
                        color = CareInk,
                    )
                }
            }
        }
    }
}

@Composable
private fun DetailInfoPanel(title: String, lines: List<String>) {
    Column(
        modifier = Modifier
            .fillMaxWidth()
            .clip(RoundedCornerShape(20.dp))
            .background(Color.White.copy(alpha = 0.68f))
            .border(1.dp, Color.White.copy(alpha = 0.86f), RoundedCornerShape(20.dp))
            .padding(14.dp),
        verticalArrangement = Arrangement.spacedBy(7.dp),
    ) {
        Text(
            text = title,
            style = MaterialTheme.typography.labelSmall.copy(
                fontSize = 14.sp,
                fontWeight = FontWeight.Bold,
            ),
            color = CareInk,
        )
        lines.forEach { line ->
            Text(
                text = line,
                style = MaterialTheme.typography.labelSmall.copy(fontSize = 12.sp),
                color = CareMuted,
            )
        }
    }
}

@Composable
private fun QuantityStepper(
    quantity: Int,
    onMinus: () -> Unit,
    onPlus: () -> Unit,
) {
    Row(
        modifier = Modifier
            .fillMaxWidth()
            .height(54.dp)
            .clip(RoundedCornerShape(17.dp))
            .background(Color.White.copy(alpha = 0.72f))
            .border(1.dp, Color.White.copy(alpha = 0.88f), RoundedCornerShape(17.dp))
            .padding(horizontal = 12.dp),
        verticalAlignment = Alignment.CenterVertically,
    ) {
        Text(
            text = "Pack count",
            modifier = Modifier.weight(1f),
            style = MaterialTheme.typography.labelSmall.copy(fontSize = 13.sp, fontWeight = FontWeight.Bold),
            color = CareInk,
        )
        QuantityButton(text = "-", onClick = onMinus)
        Text(
            text = quantity.toString(),
            modifier = Modifier.width(44.dp),
            style = MaterialTheme.typography.titleMedium.copy(fontSize = 18.sp, fontWeight = FontWeight.Bold),
            color = CareInk,
            textAlign = androidx.compose.ui.text.style.TextAlign.Center,
        )
        QuantityButton(text = "+", onClick = onPlus)
    }
}

@Composable
private fun QuantityButton(text: String, onClick: () -> Unit) {
    Box(
        modifier = Modifier
            .size(32.dp)
            .clip(CircleShape)
            .background(WellnessMustard)
            .clickable { onClick() },
        contentAlignment = Alignment.Center,
    ) {
        Text(
            text = text,
            style = MaterialTheme.typography.labelSmall.copy(fontSize = 17.sp, fontWeight = FontWeight.Bold),
            color = CareInk,
        )
    }
}

@Composable
private fun PrimaryCareButton(text: String, onClick: (() -> Unit)? = null) {
    Box(
        modifier = Modifier
            .fillMaxWidth()
            .height(56.dp)
            .shadow(10.dp, RoundedCornerShape(17.dp), spotColor = WellnessMustard.copy(alpha = 0.32f))
            .clip(RoundedCornerShape(17.dp))
            .then(if (onClick != null) Modifier.clickable { onClick() } else Modifier)
            .background(WellnessMustard),
        contentAlignment = Alignment.Center,
    ) {
        Text(
            text = text,
            style = MaterialTheme.typography.labelSmall.copy(
                fontSize = 14.sp,
                fontWeight = FontWeight.Bold,
            ),
            color = CareInk,
        )
    }
}

@Composable
private fun DoctorAppointmentPage(
    doctor: CareCatalogItem,
    onBack: () -> Unit,
    onConfirm: () -> Unit,
    modifier: Modifier = Modifier,
) {
    val dates = remember {
        listOf(
            AppointmentDate("Mon", "20"),
            AppointmentDate("Tue", "21"),
            AppointmentDate("Wed", "22"),
            AppointmentDate("Thu", "23"),
            AppointmentDate("Fri", "24"),
        )
    }
    val times = remember {
        listOf("09:00 AM", "10:30 AM", "12:00 PM", "02:00 PM", "04:30 PM", "06:00 PM")
    }
    val consultationTypes = remember {
        listOf(
            Triple("In Clinic", "Visit at clinic", Icons.Outlined.LocalHospital),
            Triple("Video Call", "Consult from home", Icons.Outlined.Person),
        )
    }
    var selectedDate by remember { mutableIntStateOf(0) }
    var selectedTime by remember { mutableIntStateOf(1) }
    var selectedType by remember { mutableIntStateOf(0) }

    Column(
        modifier = modifier.verticalScroll(rememberScrollState()),
        verticalArrangement = Arrangement.spacedBy(18.dp),
    ) {
        DoctorAppointmentTopBar(title = "Book Appointment", onBack = onBack)
        DoctorSummaryCard(doctor = doctor)
        Row(verticalAlignment = Alignment.CenterVertically) {
            Text(
                text = "Select Date",
                modifier = Modifier.weight(1f),
                style = MaterialTheme.typography.labelSmall.copy(
                    fontSize = 14.sp,
                    fontWeight = FontWeight.Bold,
                ),
                color = CareInk,
            )
            Text(
                text = "May 2026",
                style = MaterialTheme.typography.labelSmall.copy(
                    fontSize = 13.sp,
                    fontWeight = FontWeight.Bold,
                ),
                color = CareMuted,
            )
        }
        Row(
            modifier = Modifier.fillMaxWidth(),
            horizontalArrangement = Arrangement.SpaceBetween,
        ) {
            dates.forEachIndexed { index, date ->
                AppointmentDateTile(
                    date = date,
                    selected = selectedDate == index,
                    onClick = { selectedDate = index },
                )
            }
        }
        Text(
            text = "Select Time",
            style = MaterialTheme.typography.labelSmall.copy(
                fontSize = 14.sp,
                fontWeight = FontWeight.Bold,
            ),
            color = CareInk,
        )
        Column(verticalArrangement = Arrangement.spacedBy(10.dp)) {
            times.chunked(3).forEach { rowTimes ->
                Row(
                    modifier = Modifier.fillMaxWidth(),
                    horizontalArrangement = Arrangement.spacedBy(10.dp),
                ) {
                    rowTimes.forEach { time ->
                        val index = times.indexOf(time)
                        AppointmentTimeTile(
                            time = time,
                            selected = selectedTime == index,
                            onClick = { selectedTime = index },
                            modifier = Modifier.weight(1f),
                        )
                    }
                }
            }
        }
        Text(
            text = "Consultation Type",
            style = MaterialTheme.typography.labelSmall.copy(
                fontSize = 14.sp,
                fontWeight = FontWeight.Bold,
            ),
            color = CareInk,
        )
        Column(verticalArrangement = Arrangement.spacedBy(10.dp)) {
            consultationTypes.forEachIndexed { index, type ->
                ConsultationTypeTile(
                    title = type.first,
                    subtitle = type.second,
                    icon = type.third,
                    selected = selectedType == index,
                    onClick = { selectedType = index },
                )
            }
        }
        Box(
            modifier = Modifier
                .fillMaxWidth()
                .height(56.dp)
                .shadow(10.dp, RoundedCornerShape(17.dp), spotColor = WellnessMustard.copy(alpha = 0.32f))
                .clip(RoundedCornerShape(17.dp))
                .clickable { onConfirm() }
                .background(WellnessMustard),
            contentAlignment = Alignment.Center,
        ) {
            Text(
                text = "Confirm Booking",
                style = MaterialTheme.typography.labelSmall.copy(
                    fontSize = 14.sp,
                    fontWeight = FontWeight.Bold,
                ),
                color = CareInk,
            )
        }
    }
}

@Composable
private fun DoctorAppointmentTopBar(title: String, onBack: () -> Unit) {
    Row(
        modifier = Modifier.fillMaxWidth(),
        verticalAlignment = Alignment.CenterVertically,
    ) {
        Box(
            modifier = Modifier
                .size(38.dp)
                .clip(CircleShape)
                .background(Color.White.copy(alpha = 0.72f))
                .clickable { onBack() },
            contentAlignment = Alignment.Center,
        ) {
            Icon(
                imageVector = Icons.AutoMirrored.Outlined.ArrowBack,
                contentDescription = "Back to doctors",
                modifier = Modifier.size(19.dp),
                tint = CareInk,
            )
        }
        Text(
            text = title,
            modifier = Modifier.weight(1f),
            style = MaterialTheme.typography.titleMedium.copy(
                fontSize = 18.sp,
                fontWeight = FontWeight.Bold,
            ),
            color = CareInk,
        )
        Spacer(Modifier.width(38.dp))
    }
}

@Composable
private fun DoctorSummaryCard(doctor: CareCatalogItem) {
    Row(
        modifier = Modifier
            .fillMaxWidth()
            .shadow(12.dp, RoundedCornerShape(22.dp), spotColor = Color(0x18000000))
            .clip(RoundedCornerShape(22.dp))
            .background(Color.White.copy(alpha = 0.84f))
            .border(1.dp, Color.White.copy(alpha = 0.92f), RoundedCornerShape(22.dp))
            .padding(12.dp),
        verticalAlignment = Alignment.CenterVertically,
    ) {
        Box(
            modifier = Modifier
                .size(82.dp)
                .clip(RoundedCornerShape(18.dp))
                .background(doctor.accent.copy(alpha = 0.44f)),
            contentAlignment = Alignment.Center,
        ) {
            Icon(
                imageVector = Icons.Outlined.Person,
                contentDescription = null,
                modifier = Modifier.size(42.dp),
                tint = CareInk,
            )
        }
        Spacer(Modifier.width(14.dp))
        Column(modifier = Modifier.weight(1f), verticalArrangement = Arrangement.spacedBy(5.dp)) {
            Text(
                text = doctor.name,
                style = MaterialTheme.typography.labelSmall.copy(
                    fontSize = 16.sp,
                    fontWeight = FontWeight.Bold,
                ),
                color = CareInk,
                maxLines = 1,
                overflow = TextOverflow.Ellipsis,
            )
            Text(
                text = doctor.detail,
                style = MaterialTheme.typography.labelSmall.copy(fontSize = 12.sp),
                color = CareMuted,
                maxLines = 2,
                overflow = TextOverflow.Ellipsis,
            )
            Text(
                text = doctor.provider,
                style = MaterialTheme.typography.labelSmall.copy(fontSize = 11.sp),
                color = CareMuted,
                maxLines = 1,
                overflow = TextOverflow.Ellipsis,
            )
            Row(verticalAlignment = Alignment.CenterVertically) {
                Icon(
                    imageVector = Icons.Outlined.Star,
                    contentDescription = null,
                    modifier = Modifier.size(14.dp),
                    tint = Color(0xFFD4A018),
                )
                Spacer(Modifier.width(4.dp))
                Text(
                    text = "${doctor.rating} rating",
                    style = MaterialTheme.typography.labelSmall.copy(
                        fontSize = 12.sp,
                        fontWeight = FontWeight.Bold,
                    ),
                    color = CareInk,
                )
            }
        }
    }
}

@Composable
private fun AppointmentDateTile(
    date: AppointmentDate,
    selected: Boolean,
    onClick: () -> Unit,
) {
    Column(
        modifier = Modifier
            .width(58.dp)
            .height(74.dp)
            .clip(RoundedCornerShape(17.dp))
            .background(if (selected) WellnessSage.copy(alpha = 0.62f) else Color.White.copy(alpha = 0.68f))
            .border(1.dp, Color.White.copy(alpha = 0.88f), RoundedCornerShape(17.dp))
            .clickable { onClick() }
            .padding(vertical = 9.dp),
        horizontalAlignment = Alignment.CenterHorizontally,
        verticalArrangement = Arrangement.SpaceBetween,
    ) {
        Text(
            text = date.day,
            style = MaterialTheme.typography.labelSmall.copy(
                fontSize = 11.sp,
                fontWeight = FontWeight.Bold,
            ),
            color = CareMuted,
        )
        Text(
            text = date.date,
            style = MaterialTheme.typography.titleMedium.copy(
                fontSize = 18.sp,
                fontWeight = FontWeight.Bold,
            ),
            color = CareInk,
        )
    }
}

@Composable
private fun AppointmentTimeTile(
    time: String,
    selected: Boolean,
    onClick: () -> Unit,
    modifier: Modifier = Modifier,
) {
    Box(
        modifier = modifier
            .height(46.dp)
            .clip(RoundedCornerShape(13.dp))
            .background(if (selected) WellnessMustard else Color.White.copy(alpha = 0.72f))
            .border(1.dp, Color.White.copy(alpha = 0.88f), RoundedCornerShape(13.dp))
            .clickable { onClick() },
        contentAlignment = Alignment.Center,
    ) {
        Text(
            text = time,
            style = MaterialTheme.typography.labelSmall.copy(
                fontSize = 12.sp,
                fontWeight = FontWeight.Bold,
            ),
            color = CareInk,
            maxLines = 1,
        )
    }
}

@Composable
private fun ConsultationTypeTile(
    title: String,
    subtitle: String,
    icon: ImageVector,
    selected: Boolean,
    onClick: () -> Unit,
) {
    Row(
        modifier = Modifier
            .fillMaxWidth()
            .height(66.dp)
            .clip(RoundedCornerShape(17.dp))
            .background(Color.White.copy(alpha = 0.72f))
            .border(
                1.dp,
                if (selected) WellnessMustard else Color.White.copy(alpha = 0.88f),
                RoundedCornerShape(17.dp),
            )
            .clickable { onClick() }
            .padding(horizontal = 12.dp),
        verticalAlignment = Alignment.CenterVertically,
    ) {
        Box(
            modifier = Modifier
                .size(34.dp)
                .clip(RoundedCornerShape(12.dp))
                .background(if (selected) WellnessMustard.copy(alpha = 0.34f) else Color(0xFFF4F0E5)),
            contentAlignment = Alignment.Center,
        ) {
            Icon(
                imageVector = icon,
                contentDescription = null,
                modifier = Modifier.size(18.dp),
                tint = CareInk,
            )
        }
        Spacer(Modifier.width(10.dp))
        Column(modifier = Modifier.weight(1f), verticalArrangement = Arrangement.spacedBy(3.dp)) {
            Text(
                text = title,
                style = MaterialTheme.typography.labelSmall.copy(
                    fontSize = 13.sp,
                    fontWeight = FontWeight.Bold,
                ),
                color = CareInk,
            )
            Text(
                text = subtitle,
                style = MaterialTheme.typography.labelSmall.copy(fontSize = 11.sp),
                color = CareMuted,
            )
        }
        if (selected) {
            Box(
                modifier = Modifier
                    .size(22.dp)
                    .clip(CircleShape)
                    .background(WellnessMustard),
                contentAlignment = Alignment.Center,
            ) {
                Icon(
                    imageVector = Icons.Outlined.Add,
                    contentDescription = null,
                    modifier = Modifier.size(14.dp),
                    tint = CareInk,
                )
            }
        }
    }
}

@Composable
private fun CareSectionHeader(title: String, action: String) {
    Row(
        modifier = Modifier.fillMaxWidth(),
        verticalAlignment = Alignment.CenterVertically,
    ) {
        Text(
            text = title,
            style = MaterialTheme.typography.titleMedium.copy(
                fontSize = 17.sp,
                fontWeight = FontWeight.Bold,
            ),
            color = CareInk,
        )
        Spacer(Modifier.weight(1f))
        Row(
            modifier = Modifier
                .clip(RoundedCornerShape(13.dp))
                .background(Color.White.copy(alpha = 0.48f))
                .padding(horizontal = 9.dp, vertical = 5.dp),
            verticalAlignment = Alignment.CenterVertically,
        ) {
            Text(
                text = action,
                style = MaterialTheme.typography.labelSmall.copy(
                    fontSize = 11.sp,
                    fontWeight = FontWeight.Bold,
                ),
                color = CareMuted,
            )
            Spacer(Modifier.width(3.dp))
            Icon(
                imageVector = Icons.AutoMirrored.Outlined.KeyboardArrowRight,
                contentDescription = null,
                modifier = Modifier.size(14.dp),
                tint = CareMuted,
            )
        }
    }
}

private fun careModeFor(label: String, accent: Color, icon: ImageVector, appState: AppUiState): CareMode = when (label) {
    "Food" -> CareMode(
        title = "Order wellness-first meals",
        subtitle = "Balanced bowls, sattvic thalis, smoothies, and high-protein options.",
        stat = "15-45 min delivery",
        filters = listOf("All", "Healthy", "Indian", "Beverages", "Comfort", "Snacks"),
        accent = accent,
        icon = icon,
        bookingMode = false,
        items = appState.careFood.map { it.toCareCatalogItem(accent) }.ifEmpty { listOf(
            CareCatalogItem("Quinoa paneer salad", "Healthy", "FitKitchen", "Protein rich bowl", "Rs 299", "4.6", "30 min", "Veg", Icons.Outlined.Restaurant, WellnessSage),
            CareCatalogItem("Sattvic thali", "Indian", "AyurDine", "Light homestyle meal", "Rs 250", "4.8", "40 min", "Fresh", Icons.Outlined.Restaurant, WellnessMustard),
            CareCatalogItem("Green detox smoothie", "Beverages", "SmoothieBar", "Spinach, apple, mint", "Rs 150", "4.7", "15 min", "", Icons.Outlined.Restaurant, WellnessBlue),
            CareCatalogItem("Millet khichdi", "Comfort", "Leafy", "Gentle dinner bowl", "Rs 180", "4.9", "35 min", "Light", Icons.Outlined.Restaurant, WellnessPink),
            CareCatalogItem("Egg white wrap", "Snacks", "WrapIt", "Wholewheat high protein", "Rs 190", "4.6", "20 min", "", Icons.Outlined.Restaurant, WellnessLavender),
            CareCatalogItem("Sugar-free oat cookies", "Snacks", "SweetTruth", "Fiber dessert pack", "Rs 120", "4.7", "25 min", "BOGO", Icons.Outlined.Restaurant, WellnessSage),
        ) },
    )
    "Lab Tests" -> CareMode(
        title = "Book lab tests at home",
        subtitle = "Compare trusted labs, pick a slot, and keep results ready for Clara.",
        stat = "Home collection available",
        filters = listOf("All", "Profiles", "Hormones", "Vitamins", "Metabolic", "Imaging"),
        accent = accent,
        icon = icon,
        bookingMode = true,
        items = appState.careProfessionals.filter { it.type == "Lab" }.map { it.toCareCatalogItem(accent) }.ifEmpty { listOf(
            CareCatalogItem("Full body checkup", "Profiles", "AyuCare Diagnostics", "72 markers, fasting sample", "Rs 2,999", "4.8", "Today 7-9 AM", "Popular", Icons.Outlined.GraphicEq, WellnessBlue),
            CareCatalogItem("Thyroid profile", "Hormones", "ThyroCloud Labs", "T3, T4, TSH", "Rs 499", "4.7", "Home collection", "", Icons.Outlined.GraphicEq, WellnessSage),
            CareCatalogItem("Vitamin panel", "Vitamins", "Metric Pathology", "D3, B12, ferritin", "Rs 1,500", "4.9", "Tomorrow", "Home", Icons.Outlined.GraphicEq, WellnessLavender),
            CareCatalogItem("HbA1c test", "Metabolic", "Dr. Lal PathLabs", "3-month glucose marker", "Rs 399", "4.8", "Today evening", "", Icons.Outlined.GraphicEq, WellnessPink),
            CareCatalogItem("Lipid profile", "Metabolic", "Metropolis Healthcare", "Cardio risk panel", "Rs 650", "4.7", "Tomorrow", "", Icons.Outlined.GraphicEq, WellnessMustard),
            CareCatalogItem("Advanced imaging", "Imaging", "Wellness Path Labs", "Scan appointment", "Rs 5,000", "4.6", "Advance booking", "", Icons.Outlined.GraphicEq, WellnessBlue),
        ) },
    )
    "Doctor" -> CareMode(
        title = "Choose your next consult",
        subtitle = "Online and in-clinic appointments across everyday and specialist care.",
        stat = "Earliest slot in 20 min",
        filters = listOf("All", "General", "Heart", "Mind", "Hormones", "Ayurveda"),
        accent = accent,
        icon = icon,
        bookingMode = true,
        items = appState.careProfessionals.filter { it.type == "Doctor" }.map { it.toCareCatalogItem(accent) }.ifEmpty { listOf(
            CareCatalogItem("Dr. Sameer Khan", "General", "Delhi, online", "General physician, 12 years", "Rs 500", "4.6", "Online in 20 min", "", Icons.Outlined.Person, WellnessSage),
            CareCatalogItem("Dr. Aarav Sharma", "Heart", "Gurugram, online", "Cardiologist, 15 years", "Rs 1,000", "4.9", "Today 6:30 PM", "Top", Icons.Outlined.Person, WellnessPink),
            CareCatalogItem("Dr. Ishani Patel", "Mind", "Mumbai, online", "Psychiatrist, 10 years", "Rs 1,500", "4.8", "Tomorrow", "Video", Icons.Outlined.Person, WellnessBlue),
            CareCatalogItem("Dr. Kavita Nair", "Mind", "Bangalore, online", "Psychiatrist, 14 years", "Rs 2,000", "4.9", "Today", "", Icons.Outlined.Person, WellnessLavender),
            CareCatalogItem("Dr. Vikram Reddy", "Hormones", "Hyderabad clinic", "Endocrinologist, 20 years", "Rs 1,200", "5.0", "Today", "", Icons.Outlined.Person, WellnessMustard),
            CareCatalogItem("Dr. Sunita Deshmukh", "Ayurveda", "Nashik, online", "Ayurvedic MD, 25 years", "Rs 800", "5.0", "Today", "Clara pick", Icons.Outlined.Person, WellnessSage),
        ) },
    )
    "Groceries" -> CareMode(
        title = "Stock healthy groceries",
        subtitle = "Fresh staples, pantry basics, and high-protein foods for the week.",
        stat = "Fresh today",
        filters = listOf("All", "Fresh", "Pantry", "Protein", "Cooking", "Snacks"),
        accent = accent,
        icon = icon,
        bookingMode = false,
        items = appState.careProducts.filter { it.category == "Groceries" }.map { it.toCareCatalogItem(accent) }.ifEmpty { listOf(
            CareCatalogItem("Seasonal fruit basket", "Fresh", "AyuCare Fresh", "4 fresh fruits", "Rs 180", "4.8", "Today", "Fresh", Icons.Outlined.Home, WellnessPink),
            CareCatalogItem("Organic ragi", "Pantry", "Farm Pantry", "1 kg finger millet", "Rs 85", "4.7", "Today", "", Icons.Outlined.Home, WellnessSage),
            CareCatalogItem("High protein paneer", "Protein", "Dairy Daily", "200 g", "Rs 120", "4.6", "35 min", "Fresh", Icons.Outlined.Home, WellnessBlue),
            CareCatalogItem("A2 desi cow ghee", "Cooking", "Gau Gram", "500 ml", "Rs 950", "4.9", "Today", "Offer", Icons.Outlined.Home, WellnessMustard),
            CareCatalogItem("Cold pressed oil", "Cooking", "Earth Pressed", "1 L groundnut oil", "Rs 240", "4.8", "Tomorrow", "", Icons.Outlined.Home, WellnessLavender),
            CareCatalogItem("Sugar-free oat cookies", "Snacks", "SweetTruth", "Dessert pack", "Rs 120", "4.7", "25 min", "BOGO", Icons.Outlined.Home, WellnessPink),
        ) },
    )
    else -> CareMode(
        title = "Buy pharmacy essentials",
        subtitle = "Medicines, supplements, recovery basics, and devices for daily care.",
        stat = "Up to 20% off essentials",
        filters = listOf("All", "Supplements", "Ayurveda", "Medicine", "Devices", "Personal"),
        accent = accent,
        icon = icon,
        bookingMode = false,
        items = appState.careProducts.filter { it.category != "Groceries" }.map { it.toCareCatalogItem(accent) }.ifEmpty { listOf(
            CareCatalogItem("Omega-3 fish oil", "Supplements", "AyuCare Pharmacy", "60 capsules", "Rs 950", "4.7", "24 min", "Top", Icons.Outlined.LocalHospital, WellnessBlue),
            CareCatalogItem("Vitamin D3 60K IU", "Supplements", "AyuCare Pharmacy", "4 softgels", "Rs 120", "4.9", "18 min", "", Icons.Outlined.LocalHospital, WellnessMustard),
            CareCatalogItem("Ashwagandha gold", "Ayurveda", "AyuCare Pharmacy", "60 capsules", "Rs 499", "4.8", "30 min", "Offer", Icons.Outlined.LocalHospital, WellnessSage),
            CareCatalogItem("Quick digestion fizz", "Medicine", "AyuCare Pharmacy", "6 sachets", "Rs 45", "4.5", "22 min", "", Icons.Outlined.LocalHospital, WellnessPink),
            CareCatalogItem("Blood pressure monitor", "Devices", "Certified devices", "Digital monitor", "Rs 2,450", "4.9", "Tomorrow", "Care", Icons.Outlined.LocalHospital, WellnessLavender),
            CareCatalogItem("Neem tulsi skin elixir", "Personal", "Ayuveda Naturals", "100 ml", "Rs 250", "4.5", "Today", "", Icons.Outlined.LocalHospital, WellnessSage),
        ) },
    )
}

private fun Product.toCareCatalogItem(accent: Color): CareCatalogItem =
    CareCatalogItem(
        name = name,
        category = productDisplayCategory(category),
        provider = "AyuCare",
        detail = unit,
        price = price.rupeeLabel(),
        rating = rating.oneDecimal(),
        eta = if (category == "Groceries") "Today" else "24 min",
        tag = tag,
        icon = if (category == "Groceries") Icons.Outlined.Home else Icons.Outlined.LocalHospital,
        accent = accent,
        id = id,
        kind = "product",
    )

private fun FoodItem.toCareCatalogItem(accent: Color): CareCatalogItem =
    CareCatalogItem(
        name = name,
        category = category.removeSuffix(" Food"),
        provider = restaurant,
        detail = if (veg) "Veg meal" else "Care meal",
        price = price.rupeeLabel(),
        rating = rating.oneDecimal(),
        eta = time,
        tag = offer.ifBlank { if (veg) "Veg" else "" },
        icon = Icons.Outlined.Restaurant,
        accent = accent,
        id = id,
        kind = "food",
    )

private fun Professional.toCareCatalogItem(accent: Color): CareCatalogItem =
    CareCatalogItem(
        name = name,
        category = professionalDisplayCategory(this),
        provider = location,
        detail = listOf(specialty, experience).filter { it.isNotBlank() }.joinToString(", "),
        price = price.rupeeLabel(),
        rating = rating.oneDecimal(),
        eta = availability,
        tag = if (isOnline) "Online" else "",
        icon = if (type == "Lab") Icons.Outlined.GraphicEq else Icons.Outlined.Person,
        accent = accent,
        id = id,
        kind = if (type == "Lab") "lab" else "doctor",
    )

private fun productDisplayCategory(category: String): String = when (category) {
    "Medication" -> "Medicine"
    "Fitness" -> "Devices"
    "Groceries" -> "Pantry"
    else -> category
}

private fun professionalDisplayCategory(item: Professional): String {
    if (item.type == "Lab") {
        return when {
            item.specialty.contains("Thyroid", ignoreCase = true) -> "Hormones"
            item.specialty.contains("Vitamin", ignoreCase = true) -> "Vitamins"
            item.specialty.contains("Imaging", ignoreCase = true) -> "Imaging"
            else -> "Profiles"
        }
    }
    return when {
        item.specialty.contains("Cardio", ignoreCase = true) -> "Heart"
        item.specialty.contains("Psych", ignoreCase = true) -> "Mind"
        item.specialty.contains("Endocr", ignoreCase = true) -> "Hormones"
        item.specialty.contains("Ayur", ignoreCase = true) -> "Ayurveda"
        else -> "General"
    }
}

private fun Double.rupeeLabel(): String =
    if (this % 1.0 == 0.0) "Rs ${toInt()}" else "Rs ${oneDecimal()}"

private fun Double.oneDecimal(): String =
    String.format(java.util.Locale.US, "%.1f", this)

private val CareInk = Color(0xFF24210F)
private val CareMuted = Color(0xFF817865)
